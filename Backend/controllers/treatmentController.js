const TreatmentPlan = require('../models/TreatmentPlan');
const Patient = require('../models/Patient');
const User = require('../models/User');

const { generateMockAnalysis } = require('../utils/aiSimulator');

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