const Patient = require('../models/Patient');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');

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
        // Add user as oncologist
        req.body.oncologistId = req.user.id;

        const patient = await Patient.create(req.body);

        // Create audit log
        const previousHash = await AuditLog.getLastHash();
        await AuditLog.create({
            patientId: patient.id,
            userId: req.user.id,
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
        let patient = await Patient.findByPk(req.params.id);

        if (!patient) {
            return res.status(404).json({
                success: false,
                message: 'Patient not found'
            });
        }

        await patient.update(req.body);

        // Create audit log
        const previousHash = await AuditLog.getLastHash();
        await AuditLog.create({
            patientId: patient.id,
            userId: req.user.id,
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

        // Create audit log
        const previousHash = await AuditLog.getLastHash();
        await AuditLog.create({
            patientId: patientId,
            userId: req.user.id,
            action: 'patient_deleted',
            data: { mrn },
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