const OutcomePrediction = require('../models/OutcomePrediction');
const TreatmentPlan = require('../models/TreatmentPlan');
const Patient = require('../models/Patient');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const { generateMockAnalysis } = require('../utils/aiSimulator');

// @desc    Get all outcome predictions for a patient
// @route   GET /api/outcomes/patient/:patientId
// @access  Private
exports.getPatientOutcomes = async (req, res) => {
    try {
        const outcomes = await OutcomePrediction.findAll({
            where: { patientId: req.params.patientId },
            include: [
                { model: TreatmentPlan, attributes: ['recommendedProtocol'] },
                { model: User, as: 'generatedBy', attributes: ['name', 'email'] }
            ],
            order: [['createdAt', 'DESC']]
        });

        res.json({
            success: true,
            count: outcomes.length,
            data: outcomes
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get single outcome prediction
// @route   GET /api/outcomes/:id
// @access  Private
exports.getOutcome = async (req, res) => {
    try {
        const outcome = await OutcomePrediction.findByPk(req.params.id, {
            include: [
                { model: Patient, attributes: ['firstName', 'lastName', 'mrn'] },
                { model: TreatmentPlan, attributes: ['recommendedProtocol'] },
                { model: User, as: 'generatedBy', attributes: ['name', 'email'] }
            ]
        });

        if (!outcome) {
            return res.status(404).json({
                success: false,
                message: 'Outcome prediction not found'
            });
        }

        res.json({
            success: true,
            data: outcome
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Generate outcome prediction
// @route   POST /api/outcomes
// @access  Private
exports.createOutcome = async (req, res) => {
    try {
        req.body.generatedById = req.user.id;

        // Generate AI-based outcome prediction
        const aiResults = generateMockAnalysis('outcome');

        const outcome = await OutcomePrediction.create({
            ...req.body,
            overallSurvival: aiResults.overallSurvival,
            progressionFreeSurvival: aiResults.progressionFreeSurvival,
            sideEffects: aiResults.sideEffects,
            qualityOfLife: aiResults.qualityOfLife
        });

        // Create audit log
        const previousHash = await AuditLog.getLastHash();
        await AuditLog.create({
            patientId: outcome.patientId,
            userId: req.user.id,
            action: 'outcome_generated',
            data: {
                outcomeId: outcome.id,
                medianOS: outcome.overallSurvival.median,
                medianPFS: outcome.progressionFreeSurvival.median
            },
            previousHash,
            ipAddress: req.ip,
            userAgent: req.get('user-agent')
        });

        res.status(201).json({
            success: true,
            data: outcome
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};