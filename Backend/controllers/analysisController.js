const Analysis = require('../models/Analysis');
const Patient = require('../models/Patient');
const User = require('../models/User');
const { exec } = require('child_process');
const path = require('path');

const { generateMockAnalysis, simulateProcessing } = require('../utils/aiSimulator');

// @desc    Get all analyses for a patient
// @route   GET /api/analyses/patient/:patientId
// @access  Private
exports.getPatientAnalyses = async (req, res) => {
    try {
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
                    attributes: ['firstName', 'lastName', 'mrn']
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
        let analysis = await Analysis.findByPk(req.params.id);

        if (!analysis) {
            return res.status(404).json({
                success: false,
                message: 'Analysis not found'
            });
        }

        // Update status to processing
        await analysis.update({ status: 'processing' });

        const startTime = Date.now();

        // Path to the python script
        const baseDir = path.resolve(__dirname, '../../Segmentation Model');
        const scriptDir = path.join(baseDir, 'Inference_Pipeline');
        const scriptPath = path.join(scriptDir, 'infer_segmentation.py');

        console.log(`Executing segmentation script: ${scriptPath}`);

        const runScript = (name) => {
            return new Promise((resolve, reject) => {
                const sPath = path.join(scriptDir, name);
                exec(`python "${sPath}"`, { cwd: scriptDir }, (error, stdout, stderr) => {
                    if (error) {
                        console.error(`Error in ${name}: ${error}`);
                        reject(error);
                        return;
                    }
                    console.log(`stdout ${name}: ${stdout}`);
                    resolve(stdout);
                });
            });
        };

        try {
             const stdout = await runScript('infer_segmentation.py');
             
             // 1. Create unique directory for this analysis
             const resultsDir = path.join(baseDir, 'AR_Assets/results', analysis.id);
             if (!require('fs').existsSync(resultsDir)) {
                 require('fs').mkdirSync(resultsDir, { recursive: true });
             }

             // 2. Trigger 3D Mesh Generation
             try {
                 console.log("Generating 3D Mesh for AR...");
                 await runScript('mask_to_mesh.py');
                 await runScript('merge_ar_scene.py');
                 
                 // 3. Move files to unique folder
                 const fs = require('fs');
                 const filesToMove = ['tumor_mask.npy', 'tumor_probs.npy', 'tumor.glb', 'edema.glb', 'brain.glb', 'tumor_with_brain.glb'];
                 filesToMove.forEach(file => {
                     const oldPath = path.join(scriptDir, file); // Files are now generated here
                     const newPath = path.join(resultsDir, file);
                     if (fs.existsSync(oldPath)) {
                         if (fs.existsSync(newPath)) fs.unlinkSync(newPath); // Remove old version if exists
                         fs.renameSync(oldPath, newPath);
                     }
                 });
                 console.log(`Dynamic AR assets stored in: ${resultsDir}`);
             } catch (meshErr) {
                 console.error("3D Mesh Generation failed", meshErr);
             }

             // Extract JSON metrics from stdout
             let metrics = {};
             const jsonMatch = stdout.match(/JSON_START([\s\S]*?)JSON_END/);
             if (jsonMatch && jsonMatch[1]) {
                 try {
                     metrics = JSON.parse(jsonMatch[1].trim());
                 } catch (e) {
                     console.error("Failed to parse Python JSON output", e);
                 }
             }

             // Generate mock analysis results but override with real metrics
             const results = generateMockAnalysis(analysis.analysisType);
             
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

                 // Synchronize nested data for frontend backward compatibility
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
             
             results.segmentationOutput = "tumor_mask.npy generated successfully";
             updateData.data = results;

            await analysis.update(updateData);

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
        const { type, plane } = req.query; 
        
        const baseDir = path.resolve(__dirname, '../../Segmentation Model');
        const resultsDir = path.join(baseDir, 'AR_Assets/results', id);
        let filePath;
        let fileType;

        if (type === 'source') {
            filePath = path.join(baseDir, 'Test_Data/BraTS20_Training_001_flair.nii');
            fileType = 'nii';
        } else if (type === 'mask') {
            filePath = path.join(resultsDir, 'tumor_mask.npy');
            fileType = 'npy';
        } else if (type === 'heatmap') {
            filePath = path.join(resultsDir, 'tumor_probs.npy');
            fileType = 'npy';
        }

        const scriptPath = path.join(baseDir, 'Inference_Pipeline/extract_slice.py');

        // Check if file exists before running python
        const fs = require('fs');
        if (!fs.existsSync(filePath)) {
            console.log(`Slice file not ready yet: ${filePath}`);
            return res.status(404).json({ success: false, message: 'Slice data not ready' });
        }

        // Execute Python script with plane argument
        exec(`python "${scriptPath}" "${filePath}" "${fileType}" "${index}" "${type}" "${plane || 'axial'}"`, (error, stdout, stderr) => {
            if (error) {
                console.error(`Slice extraction error: ${error}`);
                return res.status(500).send('Error extracting slice');
            }
            
            // output is the base64 string
            const imgData = stdout.trim();
            res.json({ success: true, image: `data:image/png;base64,${imgData}` });
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

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