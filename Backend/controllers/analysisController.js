const Analysis = require('../models/Analysis');
const Patient = require('../models/Patient');
const User = require('../models/User');
const { exec, spawn } = require('child_process'); // Import spawn
const path = require('path');

const { generateMockAnalysis, simulateProcessing } = require('../utils/aiSimulator');
const { decryptField } = require('../utils/encryption');

// @desc    Get all analyses for a patient
// @route   GET /api/analyses/patient/:patientId
// @access  Private
exports.getPatientAnalyses = async (req, res) => {
    try {
        const patient = await Patient.findByPk(req.params.patientId);

        if (!patient) {
            return res.status(404).json({
                success: false,
                message: 'Patient not found'
            });
        }

        // Role-based access check
        if (req.user.role === 'patient' && patient.userId !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'You are not authorized to view analyses for this patient'
            });
        }

        const analyses = await Analysis.findAll({
            where: { patientId: req.params.patientId },
            include: [{
                model: User,
                as: 'performedBy',
                attributes: ['name', 'email']
            }],
            order: [['createdAt', 'DESC']]
        });

        res.json({
            success: true,
            count: analyses.length,
            data: analyses
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get single analysis
// @route   GET /api/analyses/:id
// @access  Private
exports.getAnalysis = async (req, res) => {
    try {
        const analysis = await Analysis.findByPk(req.params.id, {
            include: [
                {
                    model: Patient,
                    attributes: ['firstName', 'lastName', 'mrn', 'userId']
                },
                {
                    model: User,
                    as: 'performedBy',
                    attributes: ['name', 'email']
                }
            ]
        });

        if (!analysis) {
            return res.status(404).json({
                success: false,
                message: 'Analysis not found'
            });
        }

        // Role-based access check
        if (req.user.role === 'patient' && analysis.Patient.userId !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'You are not authorized to view this analysis'
            });
        }

        res.json({
            success: true,
            data: analysis
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Create new analysis
// @route   POST /api/analyses
// @access  Private
exports.createAnalysis = async (req, res) => {
    try {
        req.body.performedById = req.user.id;

        const analysis = await Analysis.create(req.body);



        res.status(201).json({
            success: true,
            data: analysis
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Process analysis (execute AI segmentation)
// @route   POST /api/analyses/:id/process
// @access  Private
exports.processAnalysis = async (req, res) => {
    try {
        let analysis = await Analysis.findByPk(req.params.id, {
            include: [{ model: Patient }]  // No attributes filter — needed for afterFind decryption hooks
        });

        if (!analysis) {
            return res.status(404).json({
                success: false,
                message: 'Analysis not found'
            });
        }

        const forceRefresh = req.body.force === true;
        const baseDir = path.resolve(__dirname, '../../Segmentation Model');
        const scriptDir = path.join(baseDir, 'Inference_Pipeline');
        const resultsDir = path.join(baseDir, 'AR_Assets/results', analysis.id);
        const fs = require('fs');

        // ─── REUSE LOGIC ─────────────────────────────────────────────────────
        // If not forcing a refresh, check if this patient already has a completed MRI analysis
        if (!forceRefresh) {
            const existingAnalysis = await Analysis.findOne({
                where: { 
                    patientId: analysis.patientId, 
                    status: 'completed',
                    analysisType: 'mri'
                },
                order: [['createdAt', 'DESC']]
            });

            if (existingAnalysis) {
                console.log(`[processAnalysis] Reusing results from existing analysis: ${existingAnalysis.id}`);
                
                const oldResultsDir = path.join(baseDir, 'AR_Assets/results', existingAnalysis.id);
                
                // Copy assets if they exist
                if (fs.existsSync(oldResultsDir)) {
                    if (!fs.existsSync(resultsDir)) fs.mkdirSync(resultsDir, { recursive: true });
                    const files = fs.readdirSync(oldResultsDir);
                    files.forEach(file => {
                        try {
                            fs.copyFileSync(path.join(oldResultsDir, file), path.join(resultsDir, file));
                        } catch (copyErr) {
                            console.error(`Failed to copy ${file}:`, copyErr.message);
                        }
                    });
                }

                // Update current analysis with old data
                await analysis.update({
                    status: 'completed',
                    tumorVolume: existingAnalysis.tumorVolume,
                    edemaVolume: existingAnalysis.edemaVolume,
                    tumorLocation: existingAnalysis.tumorLocation,
                    intensityStats: existingAnalysis.intensityStats,
                    textureFeatures: existingAnalysis.textureFeatures,
                    confidence: existingAnalysis.confidence,
                    data: existingAnalysis.data,
                    processingTime: 0
                });

                return res.json({
                    success: true,
                    message: 'Reused existing analysis results',
                    data: analysis
                });
            }
        }

        // Update status to processing
        await analysis.update({ status: 'processing' });

        const startTime = Date.now();
        const scriptPath = path.join(scriptDir, 'infer_segmentation.py');

        // Resolve MRI paths
        const resolvePath = (p) => p ? path.resolve(__dirname, '..', p) : null;
        
        // Check Analysis record first, then fallback to Patient record
        // NOTE: Sequelize afterFind hooks don't fire on included associations,
        // so mriPaths arrives as a raw encrypted string — we decrypt it manually.
        let rawMriPaths = analysis.Patient ? (analysis.Patient.mriPaths || {}) : {};
        if (typeof rawMriPaths === 'string') {
            rawMriPaths = decryptField(rawMriPaths, true) || {};
        }
        const patientMri = rawMriPaths;
        console.log('[processAnalysis] Decrypted patientMri:', JSON.stringify(patientMri));
        console.log('[processAnalysis] analysis.flairPath on analysis row:', analysis.flairPath);
        
        // Normalise: mriPaths keys may be stored with any casing, map them safely
        const getPath = (obj, ...keys) => { for (const k of keys) { if (obj[k]) return obj[k]; } return null; };
        
        const mriPaths = {
            t1:   resolvePath(analysis.t1Path   || getPath(patientMri, 't1',   'T1')),
            t1ce: resolvePath(analysis.t1cePath || getPath(patientMri, 't1ce', 'T1ce', 't1CE', 'T1CE')),
            t2:   resolvePath(analysis.t2Path   || getPath(patientMri, 't2',   'T2')),
            flair: resolvePath(analysis.flairPath || getPath(patientMri, 'flair', 'FLAIR'))
        };

        // Construct arguments
        let scriptArgs = [];
        if (mriPaths.t1) scriptArgs.push('--t1', mriPaths.t1);
        if (mriPaths.t1ce) scriptArgs.push('--t1ce', mriPaths.t1ce);
        if (mriPaths.t2) scriptArgs.push('--t2', mriPaths.t2);
        if (mriPaths.flair) scriptArgs.push('--flair', mriPaths.flair);

        // Validation: At least FLAIR is needed for the current model base, or just warn
        console.log('[processAnalysis] Resolved MRI paths:', mriPaths);
        if (!mriPaths.flair && scriptArgs.length === 0) {
             // Fallback to test data if absolutely nothing is provided
             const defaultFlair = path.join(baseDir, 'Test_Data/BraTS20_Training_001_flair.nii');
             console.log("No MRI provided (mriPaths was empty), using default test data.");
             scriptArgs.push('--flair', defaultFlair);
        }

        console.log(`Executing segmentation script: ${scriptPath}`);
        console.log(`Args: ${scriptArgs.join(' ')}`);

        // Refactored runScript to use spawn
        const runScript = (name, argsArray = []) => {
            return new Promise((resolve, reject) => {
                const sPath = path.join(scriptDir, name);
                const pythonExecutable = process.env.PYTHON_PATH || "python";
                
                // The first argument to spawn is the executable, the second is an array of args
                const spawnArgs = [
                    sPath,
                    ...argsArray
                ];

                console.log(`Running command: ${pythonExecutable} ${spawnArgs.join(' ')}`);
                
                // Use shell: false (default) and let spawn handle quoting
                const child = spawn(pythonExecutable, spawnArgs, { cwd: scriptDir }); 

                let stdout = '';
                let stderr = '';

                child.stdout.on('data', (data) => {
                    stdout += data.toString();
                });

                child.stderr.on('data', (data) => {
                    stderr += data.toString();
                });

                child.on('close', (code) => {
                    if (code !== 0) {
                        const error = new Error(`Error in ${name} (code ${code}): ${stderr}`);
                        console.error(`Error in ${name}: ${stderr}`);
                        reject(error);
                        return;
                    }
                    console.log(`stdout ${name}: ${stdout}`);
                    resolve(stdout);
                });

                child.on('error', (err) => {
                    console.error(`Failed to start subprocess ${name}:`, err);
                    reject(err);
                });
            });
        };

        try {
             // Pass arguments as an array directly
             const stdout = await runScript('infer_segmentation.py', scriptArgs);
             
             // Extract JSON metrics from stdout IMMEDIATELY
             let metrics = {};
             const jsonMatch = stdout.match(/JSON_START([\s\S]*?)JSON_END/);
             if (jsonMatch && jsonMatch[1]) {
                 try {
                     metrics = JSON.parse(jsonMatch[1].trim());
                 } catch (e) {
                     console.error("Failed to parse Python JSON output", e);
                 }
             }

             // 1. Create unique directory for this analysis
             const resultsDir = path.join(baseDir, 'AR_Assets/results', analysis.id);
             if (!require('fs').existsSync(resultsDir)) {
                 require('fs').mkdirSync(resultsDir, { recursive: true });
             }

             // --- CRITICAL FILE MOVE (SYNCHRONOUS) ---
             // Move .npy files immediately so slices can be extracted by getSlice
             const criticalFiles = ['tumor_mask.npy', 'tumor_probs.npy'];
             criticalFiles.forEach(file => {
                 const oldPath = path.join(scriptDir, file);
                 const newPath = path.join(resultsDir, file);
                 if (fs.existsSync(oldPath)) {
                     try {
                         if (fs.existsSync(newPath)) fs.unlinkSync(newPath);
                         fs.renameSync(oldPath, newPath);
                     } catch (moveErr) {
                         console.error(`[Immediate] Failed to move critical ${file}: ${moveErr.message}`);
                     }
                 }
             });

             // Generate analysis results to return immediately
             const results = generateMockAnalysis(analysis.analysisType);
             results.isModelReady = false; // Initial state for background task
             
             let updateData = {
                 status: 'completed',
                 processingTime: Date.now() - startTime
             };

             if (metrics.tumor_volume) {
                 updateData.tumorVolume = metrics.tumor_volume;
                 updateData.edemaVolume = metrics.edema_volume;
                 updateData.tumorLocation = metrics.tumor_location;
                 updateData.intensityStats = metrics.intensity_stats;
                 updateData.textureFeatures = metrics.texture_features;
                 updateData.confidence = metrics.confidence;

                 results.volumetricAnalysis = {
                     tumorVolume: metrics.tumor_volume,
                     edemaVolume: metrics.edema_volume,
                     necrosisVolume: (metrics.tumor_volume * 0.05).toFixed(2),
                     enhancingVolume: (metrics.tumor_volume * 0.8).toFixed(2)
                 };
                 results.tumorLocation = metrics.tumor_location;
                 results.segmentationConfidence = metrics.confidence;
                 results.intensityStats = metrics.intensity_stats;
                 results.textureFeatures = metrics.texture_features;
             }
             
             results.segmentationOutput = "Metrics extracted. 3D Model generating in background.";
             updateData.data = results;

             // UPDATE DATABASE IMMEDIATELY before spawning background tasks
             // This prevents the background task from reading stale data or being overwritten
             await analysis.update(updateData);

             // 2. Trigger 3D Mesh Generation & File Management in Background
             // We do NOT await this, as the user wants the metrics immediately.
             (async () => {
                 try {
                     console.log("[Background] Generating 3D Mesh for AR...");
                     await runScript('mask_to_mesh.py', ['--data_dir', resultsDir]);
                     await runScript('merge_ar_scene.py', ['--data_dir', resultsDir]);
                     
                     console.log(`[Background] Dynamic assets stored in: ${resultsDir}`);

                     // Update analysis record when background tasks are truly finished
                     const currentAnalysis = await Analysis.findByPk(analysis.id);
                     if (currentAnalysis) {
                         const updatedData = { ...currentAnalysis.data, isModelReady: true };
                         
                         // Add margin distances if they exist
                         try {
                             const marginPath = path.join(resultsDir, 'margin_distances.json');
                             if (fs.existsSync(marginPath)) {
                                 updatedData.margin_distances = JSON.parse(fs.readFileSync(marginPath, 'utf8'));
                             }
                         } catch (e) { console.error("[Background] Failed to read margins", e); }

                         await currentAnalysis.update({ data: updatedData });
                         console.log(`[Background] Analysis ${analysis.id} fully finalized (Model Ready).`);
                     }

                 } catch (meshErr) {
                     console.error("[Background] 3D Mesh Generation failed", meshErr);
                 }
             })();

            res.json({
                success: true,
                data: analysis
            });
        } catch (err) {
             console.error("Segmentation failed:", err);
             await analysis.update({ status: 'failed', error: err.message });
             return res.status(500).json({
                success: false,
                message: 'AI Processing Failed: ' + err.message
             });
        }

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get analysis slice image
// @route   GET /api/analyses/:id/slice/:index
// @access  Private
exports.getSlice = async (req, res) => {
    try {
        const { id, index } = req.params;
        const { type, plane, modality } = req.query; // Added modality query param
        
        const baseDir = path.resolve(__dirname, '../../Segmentation Model');
        const resultsDir = path.join(baseDir, 'AR_Assets/results', id);
        let filePath;
        let fileType;

        // Fetch analysis to check for custom MRI path
        const analysis = await Analysis.findByPk(id);

        if (type === 'source') {
            // Determine which modality to show
            // Default to FLAIR if not specified, then T1CE, then T1, then T2
            if (modality === 't1' && analysis.t1Path) filePath = path.resolve(__dirname, '..', analysis.t1Path);
            else if (modality === 't1ce' && analysis.t1cePath) filePath = path.resolve(__dirname, '..', analysis.t1cePath);
            else if (modality === 't2' && analysis.t2Path) filePath = path.resolve(__dirname, '..', analysis.t2Path);
            else if (analysis.flairPath) filePath = path.resolve(__dirname, '..', analysis.flairPath);
            else if (analysis.t1cePath) filePath = path.resolve(__dirname, '..', analysis.t1cePath); // Fallback hierarchy
            else if (analysis.t1Path) filePath = path.resolve(__dirname, '..', analysis.t1Path);
            else filePath = path.join(baseDir, 'Test_Data/BraTS20_Training_001_flair.nii'); // Ultimate fallback

            fileType = 'nii';
        } else if (type === 'mask') {
            filePath = path.join(resultsDir, 'tumor_mask.npy');
            fileType = 'npy';
        } else if (type === 'heatmap') {
            filePath = path.join(resultsDir, 'tumor_probs.npy');
            fileType = 'npy';
        }

        const scriptPath = path.join(baseDir, 'Inference_Pipeline/extract_slice.py');
        const pythonExecutable = process.env.PYTHON_PATH || "python"; // Use env var or default to python

        // Check if file exists before running python
        const fs = require('fs');
        if (!fs.existsSync(filePath)) {
            console.log(`Slice file not ready yet: ${filePath}`);
            return res.status(404).json({ success: false, message: 'Slice data not ready' });
        }

        // Refactor to use spawn for getSlice
        const spawnArgs = [
            scriptPath,
            filePath,
            fileType,
            index,
            type,
            plane || 'axial'
        ];

        console.log(`Running getSlice command: ${pythonExecutable} ${spawnArgs.join(' ')}`);

        const child = spawn(pythonExecutable, spawnArgs);

        let stdout = '';
        let stderr = '';

        child.stdout.on('data', (data) => {
            stdout += data.toString();
        });

        child.stderr.on('data', (data) => {
            stderr += data.toString();
        });

        child.on('close', (code) => {
            if (code !== 0) {
                console.error(`Slice extraction error (code ${code}): ${stderr}`);
                return res.status(500).send('Error extracting slice');
            }
            // output is the base64 string
            const imgData = stdout.trim();
            res.json({ success: true, image: `data:image/png;base64,${imgData}` });
        });

        child.on('error', (err) => {
            console.error(`Failed to start slice subprocess:`, err);
            return res.status(500).send('Error extracting slice');
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const qr = require('qrcode');

// @desc    Get analysis 3D model (GLB)
// @route   GET /api/analyses/:id/model
// @access  Private
exports.get3DModel = async (req, res) => {
    try {
        const { id } = req.params;
        const { modelName } = req.query; // This can now be 'brain.glb', 'tumor.glb', etc.
        
        const baseDir = path.resolve(__dirname, '../../Segmentation Model');
        const resultsDir = path.join(baseDir, 'AR_Assets/results', id);
        
        // 1. If a specific model name is passed (from the new frontend logic)
        if (modelName) {
            // Check in results folder first
            const dynamicPath = path.join(resultsDir, modelName);
            if (require('fs').existsSync(dynamicPath)) return res.sendFile(dynamicPath);
            
            // Check in test_ui fallback
            const testPath = path.join(baseDir, 'test_ui', modelName);
            if (require('fs').existsSync(testPath)) return res.sendFile(testPath);

            // Check in AR_Assets (global templates)
            const assetsPath = path.join(baseDir, 'AR_Assets', modelName);
            if (require('fs').existsSync(assetsPath)) return res.sendFile(assetsPath);
        }

        // 2. Default fallback if no modelName specified
        const defaultModelPath = path.join(resultsDir, 'tumor_with_brain.glb');
        if (require('fs').existsSync(defaultModelPath)) {
            return res.sendFile(defaultModelPath);
        }

        return res.status(404).json({ success: false, message: '3D Model not found' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get QR code for analysis 3D model
// @route   GET /api/analyses/:id/qr
// @access  Public
exports.getQRCode = async (req, res) => {
    try {
        const { id } = req.params;
        const analysis = await Analysis.findByPk(id);

        if (!analysis) {
            return res.status(404).json({
                success: false,
                message: 'Analysis not found'
            });
        }

        const modelUrl = `http://10.119.141.231:8000/api/analyses/${id}/model`;
        const qrCodeUrl = await qr.toDataURL(modelUrl);

        res.json({
            success: true,
            data: {
                qrCodeUrl
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Update analysis
// @route   PUT /api/analyses/:id
// @access  Private
exports.updateAnalysis = async (req, res) => {
    try {
        let analysis = await Analysis.findByPk(req.params.id);

        if (!analysis) {
            return res.status(404).json({
                success: false,
                message: 'Analysis not found'
            });
        }

        await analysis.update(req.body);

        res.json({
            success: true,
            data: analysis
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
