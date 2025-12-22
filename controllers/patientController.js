const Patient = require('../models/Patient');
const AuditLog = require('../models/AuditLog');

// @desc    Get all patients
// @route   GET /api/patients
// @access  Private
exports.getPatients = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const patients = await Patient.find()
            .populate('oncologist', 'name email')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Patient.countDocuments();

        res.json({
            success: true,
            count: patients.length,
            total,
            page,
            pages: Math.ceil(total / limit),
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
        const patient = await Patient.findById(req.params.id)
            .populate('oncologist', 'name email');

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
        // Add user as oncologist
        req.body.oncologist = req.user.id;

        const patient = await Patient.create(req.body);

        // Create audit log
        const previousHash = await AuditLog.getLastHash();
        await AuditLog.create({
            patient: patient._id,
            user: req.user.id,
            action: 'patient_created',
            data: { mrn: patient.mrn, name: `${patient.firstName} ${patient.lastName}` },
            previousHash,
            ipAddress: req.ip,
            userAgent: req.get('user-agent')
        });

        res.status(201).json({
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

// @desc    Update patient
// @route   PUT /api/patients/:id
// @access  Private
exports.updatePatient = async (req, res) => {
    try {
        let patient = await Patient.findById(req.params.id);

        if (!patient) {
            return res.status(404).json({
                success: false,
                message: 'Patient not found'
            });
        }

        patient = await Patient.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        // Create audit log
        const previousHash = await AuditLog.getLastHash();
        await AuditLog.create({
            patient: patient._id,
            user: req.user.id,
            action: 'patient_updated',
            data: { updates: Object.keys(req.body) },
            previousHash,
            ipAddress: req.ip,
            userAgent: req.get('user-agent')
        });

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

// @desc    Delete patient
// @route   DELETE /api/patients/:id
// @access  Private
exports.deletePatient = async (req, res) => {
    try {
        const patient = await Patient.findById(req.params.id);

        if (!patient) {
            return res.status(404).json({
                success: false,
                message: 'Patient not found'
            });
        }

        await patient.deleteOne();

        // Create audit log
        const previousHash = await AuditLog.getLastHash();
        await AuditLog.create({
            patient: patient._id,
            user: req.user.id,
            action: 'patient_deleted',
            data: { mrn: patient.mrn },
            previousHash,
            ipAddress: req.ip,
            userAgent: req.get('user-agent')
        });

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
