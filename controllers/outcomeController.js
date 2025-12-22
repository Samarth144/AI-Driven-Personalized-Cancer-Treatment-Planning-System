const OutcomePrediction = require('../models/OutcomePrediction');
const AuditLog = require('../models/AuditLog');
const { generateMockAnalysis } = require('../utils/aiSimulator');

// @desc    Get all outcome predictions for a patient
// @route   GET /api/outcomes/patient/:patientId
// @access  Private
exports.getPatientOutcomes = async (req, res) => {
    try {
        const outcomes = await OutcomePrediction.find({ patient: req.params.patientId })
            .populate('treatmentPlan', 'recommendedProtocol')
            .populate('generatedBy', 'name email')
            .sort({ createdAt: -1 });

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
        const outcome = await OutcomePrediction.findById(req.params.id)
            .populate('patient', 'firstName lastName mrn')
            .populate('treatmentPlan', 'recommendedProtocol')
            .populate('generatedBy', 'name email');

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
        req.body.generatedBy = req.user.id;

        // Generate AI-based outcome prediction
        const aiResults = generateMockAnalysis('outcome');

        const outcomeData = {
            ...req.body,
            overallSurvival: aiResults.overallSurvival,
            progressionFreeSurvival: aiResults.progressionFreeSurvival,
            sideEffects: aiResults.sideEffects,
            qualityOfLife: aiResults.qualityOfLife
        };

        const outcome = await OutcomePrediction.create(outcomeData);

        // Create audit log
        const previousHash = await AuditLog.getLastHash();
        await AuditLog.create({
            patient: outcome.patient,
            user: req.user.id,
            action: 'outcome_generated',
            data: {
                outcomeId: outcome._id,
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
