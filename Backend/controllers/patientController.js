const Patient = require('../models/Patient');
const User = require('../models/User');
const fs = require('fs');
const path = require('path');
const pdfParser = require('pdf-parse');
const axios = require('axios');

// @desc    Analyze pathology report for a patient
// @route   POST /api/patients/:id/analyze-pathology
// @access  Private
exports.analyzePathology = async (req, res) => {
    try {
        const patient = await Patient.findByPk(req.params.id);

        if (!patient) {
            console.error(`Patient not found: ${req.params.id}`);
            return res.status(404).json({ message: 'Patient not found' });
        }

        console.log(`Analyzing pathology for patient ${req.params.id}`);
        console.log(`Stored Report Path: '${patient.pathologyReportPath}'`);

        if (!patient.pathologyReportPath) {
            console.error("No pathology report path in DB");
            return res.status(400).json({ message: 'No pathology report linked to this patient. Please upload one via the Intake Form.' });
        }

        // Construct absolute path
        const absolutePath = path.resolve(__dirname, '..', patient.pathologyReportPath);
        console.log(`Absolute File Path: ${absolutePath}`);

        if (!fs.existsSync(absolutePath)) {
             console.error("File does not exist on disk at:", absolutePath);
             const dir = path.dirname(absolutePath);
             if (fs.existsSync(dir)) {
                 console.log(`Contents of ${dir}:`, fs.readdirSync(dir));
             } else {
                 console.log(`Directory ${dir} does not exist.`);
             }
             return res.status(404).json({ message: 'Report file not found on server. It may have been deleted.' });
        }

        let dataBuffer;
        try {
            dataBuffer = fs.readFileSync(absolutePath);
            console.log("File read successfully.");
        } catch (readErr) {
            console.error("File read error:", readErr);
            return res.status(500).json({ message: "Failed to read file from disk." });
        }
        
        let extractedText = "";
        try {
            console.log("pdfParser keys:", Object.keys(pdfParser)); 
            
            // Temporary fix attempt: Check if it behaves like version 1.1.1 or 2.x
            // If it's the class-based one:
            if (pdfParser.PDFParse) {
                 const parser = new pdfParser.PDFParse({ data: dataBuffer });
                 const data = await parser.getText();
                 extractedText = data.text;
            } else if (typeof pdfParser === 'function') {
                 const data = await pdfParser(dataBuffer);
                 extractedText = data.text;
            } else {
                 // Try default if it's an object with default
                 const func = pdfParser.default || pdfParser;
                 if (typeof func === 'function') {
                     const data = await func(dataBuffer);
                     extractedText = data.text;
                 } else {
                     throw new Error(`Unknown pdf-parse structure: ${JSON.stringify(pdfParser)}`);
                 }
            }

            console.log(`PDF Parsed. Text length: ${extractedText.length} chars`);
        } catch (pdfErr) {
            console.error("PDF Parse error:", pdfErr);
            return res.status(500).json({ message: "Failed to parse PDF content.", error: pdfErr.message });
        }

        // Send to AI Engine
        console.log("Sending to AI Engine...");
        const aiResponse = await axios.post('http://localhost:5000/process_report_text', {
            text: extractedText,
        });
        console.log("AI Engine responded successfully.");

        // Save extracted data and analysis to DB
        await patient.update({
            medicalHistory: extractedText, // Save raw extracted text
            pathologyAnalysis: aiResponse.data // Save structured AI analysis
        });

        res.json({
            success: true,
            ...aiResponse.data
        });

    } catch (error) {
        console.error("Error analyzing pathology:", error.message);
        if (error.response) {
             console.error("AI Engine Response Error:", error.response.data);
             return res.status(500).json({ message: 'AI Engine Error', details: error.response.data });
        }
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get all patients
// @route   GET /api/patients
// @access  Private
exports.getPatients = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        const { count, rows: patients } = await Patient.findAndCountAll({
            include: [{
                model: User,
                as: 'oncologist',
                attributes: ['name', 'email']
            }],
            order: [['createdAt', 'DESC']],
            limit,
            offset
        });

        res.json({
            success: true,
            count: patients.length,
            total: count,
            page,
            pages: Math.ceil(count / limit),
            data: patients
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get single patient
// @route   GET /api/patients/:id
// @access  Private
exports.getPatient = async (req, res) => {
    try {
        const patient = await Patient.findByPk(req.params.id, {
            include: [{
                model: User,
                as: 'oncologist',
                attributes: ['name', 'email']
            }]
        });

        if (!patient) {
            return res.status(404).json({
                success: false,
                message: 'Patient not found'
            });
        }

        res.json({
            success: true,
            data: patient
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Create new patient
// @route   POST /api/patients
// @access  Private
exports.createPatient = async (req, res) => {
    try {
        const {
            name, mrn, dob, gender, contact, diagnosisDate, cancerType,
            idh1, mgmt, er, pr, her2, brca, pdl1, egfr, alk, ros1, kras, afp,
            kps, ecog, symptoms, comorbidities, pathologyReport, pathologyReportPath, mriPaths
        } = req.body;
        // 1. Split Name
        const nameParts = name ? name.split(' ') : ['Unknown', ''];
        const firstName = nameParts[0];
        const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : 'Unknown';

        // 2. Format Arrays
        const symptomsArray = typeof symptoms === 'string' ? symptoms.split(',').filter(s => s.trim()) : [];
        const comorbiditiesArray = typeof comorbidities === 'string' ? comorbidities.split(',').filter(s => s.trim()) : [];

        // 3. Construct Genomic Profile
        const genomicProfile = {
            idh1, mgmt, er, pr, her2, brca, pdl1, egfr, alk, ros1, kras, afp
        };

        // Remove undefined/null keys from genomicProfile
        Object.keys(genomicProfile).forEach(key => 
            (genomicProfile[key] === undefined || genomicProfile[key] === null) && delete genomicProfile[key]
        );

        // 4. Create Patient Record
        const patientData = {
            firstName,
            lastName,
            mrn,
            dateOfBirth: dob,
            gender: gender ? gender.toLowerCase() : 'other',
            phone: contact,
            diagnosis: cancerType || 'Unknown', // Using cancerType as primary diagnosis
            diagnosisDate,
            cancerType,
            status: 'Pending',
            performanceStatus: ecog !== undefined ? String(ecog) : '1',
            kps: kps ? parseInt(kps) : 100,
            symptoms: symptomsArray,
            comorbidities: comorbiditiesArray,
            genomicProfile,
            medicalHistory: pathologyReport, // Storing report text content here
            pathologyReportPath, // Storing file path here
            mriPaths,
            oncologistId: req.user.id
        };

        const patient = await Patient.create(patientData);

        res.status(201).json({
            success: true,
            data: patient
        });
    } catch (error) {
        console.error("Error creating patient:", error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Update patient
// @route   PUT /api/patients/:id
// @access  Private
exports.updatePatient = async (req, res) => {
    try {
        let patient = await Patient.findByPk(req.params.id);

        if (!patient) {
            return res.status(404).json({
                success: false,
                message: 'Patient not found'
            });
        }

        const { 
            name, mrn, dob, gender, contact, diagnosisDate, cancerType,
            idh1, mgmt, er, pr, her2, brca, pdl1, egfr, alk, ros1, kras, afp,
            kps, ecog, symptoms, comorbidities, pathologyReport, pathologyReportPath, mriPaths
        } = req.body;

        const updates = {};

        // 1. Handle Name Split if provided
        if (name) {
            const nameParts = name.split(' ');
            updates.firstName = nameParts[0];
            updates.lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : patient.lastName; 
        }

        if (mrn) updates.mrn = mrn;
        if (dob) updates.dateOfBirth = dob;
        if (gender) updates.gender = gender;
        if (contact) updates.phone = contact;
        if (diagnosisDate) updates.diagnosisDate = diagnosisDate;
        if (cancerType) {
            updates.cancerType = cancerType;
            updates.diagnosis = cancerType;
        }
        if (pathologyReport) updates.medicalHistory = pathologyReport;
        if (pathologyReportPath) updates.pathologyReportPath = pathologyReportPath;
        if (mriPaths) {
            updates.mriPaths = { ...(patient.mriPaths || {}), ...mriPaths };
        }
        
        // 2. Handle Arrays
        if (symptoms !== undefined) {
            updates.symptoms = typeof symptoms === 'string' ? symptoms.split(',').filter(s => s.trim()) : symptoms;
        }
        if (comorbidities !== undefined) {
            updates.comorbidities = typeof comorbidities === 'string' ? comorbidities.split(',').filter(s => s.trim()) : comorbidities;
        }

        // 3. Handle Scores
        if (ecog !== undefined) updates.performanceStatus = String(ecog);
        if (kps !== undefined) updates.kps = parseInt(kps);

        // 4. Update Genomic Profile (Merge with existing)
        const newMarkers = { idh1, mgmt, er, pr, her2, brca, pdl1, egfr, alk, ros1, kras, afp };
        // Remove undefined keys
        Object.keys(newMarkers).forEach(key => newMarkers[key] === undefined && delete newMarkers[key]);
        
        if (Object.keys(newMarkers).length > 0) {
            updates.genomicProfile = { ...(patient.genomicProfile || {}), ...newMarkers };
        }

        await patient.update(updates);

        res.json({
            success: true,
            data: patient
        });
    } catch (error) {
        console.error("Error updating patient:", error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Delete patient
// @route   DELETE /api/patients/:id
// @access  Private
exports.deletePatient = async (req, res) => {
    try {
        const patient = await Patient.findByPk(req.params.id);

        if (!patient) {
            return res.status(404).json({
                success: false,
                message: 'Patient not found'
            });
        }

        const mrn = patient.mrn;
        const patientId = patient.id;
        
        await patient.destroy();



        res.json({
            success: true,
            data: {}
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};