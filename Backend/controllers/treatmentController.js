const TreatmentPlan = require('../models/TreatmentPlan');
const Patient = require('../models/Patient');
const User = require('../models/User');
const axios = require('axios');
const { formatEvidenceWithGemini } = require('../utils/geminiFormatter'); // Updated import

const { generateMockAnalysis } = require('../utils/aiSimulator');

// @desc    Generate and format a treatment plan using AI and Gemini
// @route   POST /api/treatments/generate-formatted
// @access  Private
exports.generateFormattedPlan = async (req, res) => {
    console.log('--- Initiating generateFormattedPlan ---');
    console.log('Request Body:', JSON.stringify(req.body, null, 2));

    try {
        // Step 1: Call the Python AI engine to get the raw treatment plan and evidence.
        console.log('Step 1: Calling Python AI engine at http://127.0.0.1:5000/recommend...');
        const aiEngineResponse = await axios.post('http://127.0.0.1:5000/recommend', req.body);

        const rawTreatmentData = aiEngineResponse.data;
        console.log('Step 1a: Successfully received data from AI engine.');
        // Log only a snippet of the data to avoid flooding the console
        console.log('Raw Data Snippet:', JSON.stringify(rawTreatmentData).substring(0, 200));

        // Extract the raw plan and evidence from the AI engine's response
        const rawPlan = rawTreatmentData.plan || 'No specific plan provided by AI engine.';
        const evidence = rawTreatmentData.evidence || [];

        // Step 2: Format ONLY the evidence using the Gemini API formatter.
        console.log('Step 2: Formatting evidence with Gemini...');
        const formattedEvidence = await formatEvidenceWithGemini(evidence);
        console.log('Step 2a: Successfully formatted evidence with Gemini.');

        // Step 3: Send the raw plan and formatted evidence back to the frontend.
        console.log('Step 3: Sending raw plan and formatted evidence to frontend.');
        res.json({
            success: true,
            data: {
                rawPlan: rawPlan,
                formattedEvidence: formattedEvidence
            }
        });
        console.log('--- generateFormattedPlan Completed Successfully ---');

    } catch (error) {
        console.error('--- ERROR in generateFormattedPlan ---');
        console.error('Error object:', error);

        // Distinguish between AI engine error and other errors
        if (error.response) {
            // Error from a downstream service (like AI engine)
            console.error('Downstream service error status:', error.response.status);
            console.error('Downstream service error data:', error.response.data);
            return res.status(500).json({
                success: false,
                message: 'Failed to get a valid response from the AI engine.',
                error: error.response.data
            });
        } else if (error.request) {
            // Request was made but no response received
            console.error('The request was made, but no response was received from the AI engine.');
            return res.status(500).json({
                success: false,
                message: 'The AI engine is not responding. Please ensure it is running and accessible at http://127.0.0.1:5000.'
            });
        }
        // Other errors (e.g., Gemini API failure, data processing error)
        console.error('A non-request error occurred:', error.message);
        res.status(500).json({
            success: false,
            message: error.message || 'An internal server error occurred during plan generation.'
        });
    }
};


// @desc    Get all treatment plans for a patient
// @route   GET /api/treatments/patient/:patientId
// @access  Private
exports.getPatientTreatments = async (req, res) => {
    try {
        const treatments = await TreatmentPlan.findAll({
            where: { patientId: req.params.patientId },
            include: [
                { model: User, as: 'createdBy', attributes: ['name', 'email'] },
                { model: User, as: 'approvedBy', attributes: ['name', 'email'] }
            ],
            order: [['createdAt', 'DESC']]
        });

        res.json({
            success: true,
            count: treatments.length,
            data: treatments
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get single treatment plan
// @route   GET /api/treatments/:id
// @access  Private
exports.getTreatment = async (req, res) => {
    try {
        const treatment = await TreatmentPlan.findByPk(req.params.id, {
            include: [
                { model: Patient, attributes: ['firstName', 'lastName', 'mrn'] },
                { model: User, as: 'createdBy', attributes: ['name', 'email'] },
                { model: User, as: 'approvedBy', attributes: ['name', 'email'] }
            ]
        });

        if (!treatment) {
            return res.status(404).json({
                success: false,
                message: 'Treatment plan not found'
            });
        }

        res.json({
            success: true,
            data: treatment
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Generate treatment plan
// @route   POST /api/treatments
// @access  Private
exports.createTreatment = async (req, res) => {
    try {
        req.body.createdById = req.user.id;

        // If no treatment data provided, generate using AI
        if (!req.body.recommendedProtocol) {
            const aiResults = generateMockAnalysis('treatment');
            req.body.recommendedProtocol = aiResults.recommendedProtocol;
            req.body.confidence = parseFloat(aiResults.confidence);
            req.body.alternativeOptions = aiResults.alternativeOptions;
            req.body.guidelineAlignment = aiResults.guidelineAlignment;
            req.body.rationale = aiResults.rationale;
        }

        const treatment = await TreatmentPlan.create(req.body);



        res.status(201).json({
            success: true,
            data: treatment
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Update treatment plan
// @route   PUT /api/treatments/:id
// @access  Private
exports.updateTreatment = async (req, res) => {
    try {
        let treatment = await TreatmentPlan.findByPk(req.params.id);

        if (!treatment) {
            return res.status(404).json({
                success: false,
                message: 'Treatment plan not found'
            });
        }

        await treatment.update(req.body);



        res.json({
            success: true,
            data: treatment
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Approve treatment plan
// @route   POST /api/treatments/:id/approve
// @access  Private (Oncologist only)
exports.approveTreatment = async (req, res) => {
    try {
        let treatment = await TreatmentPlan.findByPk(req.params.id);

        if (!treatment) {
            return res.status(404).json({
                success: false,
                message: 'Treatment plan not found'
            });
        }

        await treatment.update({
            status: 'approved',
            approvedById: req.user.id,
            approvalDate: Date.now()
        });



        res.json({
            success: true,
            data: treatment
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};