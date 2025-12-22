const TreatmentPlan = require('../models/TreatmentPlan');
const AuditLog = require('../models/AuditLog');
const { generateMockAnalysis } = require('../utils/aiSimulator');

// @desc    Get all treatment plans for a patient
// @route   GET /api/treatments/patient/:patientId
// @access  Private
exports.getPatientTreatments = async (req, res) => {
    try {
        const treatments = await TreatmentPlan.find({ patient: req.params.patientId })
            .populate('createdBy', 'name email')
            .populate('approvedBy', 'name email')
            .sort({ createdAt: -1 });

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
        const treatment = await TreatmentPlan.findById(req.params.id)
            .populate('patient', 'firstName lastName mrn')
            .populate('createdBy', 'name email')
            .populate('approvedBy', 'name email');

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
        req.body.createdBy = req.user.id;

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

        // Create audit log
        const previousHash = await AuditLog.getLastHash();
        await AuditLog.create({
            patient: treatment.patient,
            user: req.user.id,
            action: 'treatment_created',
            data: { protocol: treatment.recommendedProtocol, treatmentId: treatment._id },
            previousHash,
            ipAddress: req.ip,
            userAgent: req.get('user-agent')
        });

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
        let treatment = await TreatmentPlan.findById(req.params.id);

        if (!treatment) {
            return res.status(404).json({
                success: false,
                message: 'Treatment plan not found'
            });
        }

        treatment = await TreatmentPlan.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        // Create audit log
        const previousHash = await AuditLog.getLastHash();
        await AuditLog.create({
            patient: treatment.patient,
            user: req.user.id,
            action: 'treatment_updated',
            data: { updates: Object.keys(req.body) },
            previousHash,
            ipAddress: req.ip,
            userAgent: req.get('user-agent')
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

// @desc    Approve treatment plan
// @route   POST /api/treatments/:id/approve
// @access  Private (Oncologist only)
exports.approveTreatment = async (req, res) => {
    try {
        let treatment = await TreatmentPlan.findById(req.params.id);

        if (!treatment) {
            return res.status(404).json({
                success: false,
                message: 'Treatment plan not found'
            });
        }

        treatment.status = 'approved';
        treatment.approvedBy = req.user.id;
        treatment.approvalDate = Date.now();

        await treatment.save();

        // Create audit log
        const previousHash = await AuditLog.getLastHash();
        await AuditLog.create({
            patient: treatment.patient,
            user: req.user.id,
            action: 'treatment_approved',
            data: { treatmentId: treatment._id, protocol: treatment.recommendedProtocol },
            previousHash,
            ipAddress: req.ip,
            userAgent: req.get('user-agent')
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
