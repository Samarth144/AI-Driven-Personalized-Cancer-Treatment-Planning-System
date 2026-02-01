const AuditLog = require('../models/AuditLog');
const crypto = require('crypto');

// @desc    Get all audit logs
// @route   GET /api/audit
// @access  Private (Admin/Researcher)
exports.getAuditLogs = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const logs = await AuditLog.find()
            .populate('user', 'name email role')
            .populate('patient', 'firstName lastName mrn')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await AuditLog.countDocuments();

        res.json({
            success: true,
            count: logs.length,
            total,
            page,
            pages: Math.ceil(total / limit),
            data: logs
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get audit logs for a specific patient
// @route   GET /api/audit/patient/:patientId
// @access  Private
exports.getPatientAuditLogs = async (req, res) => {
    try {
        const logs = await AuditLog.find({ patient: req.params.patientId })
            .populate('user', 'name email role')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: logs.length,
            data: logs
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Verify blockchain integrity
// @route   POST /api/audit/verify
// @access  Private (Admin/Researcher)
exports.verifyBlockchain = async (req, res) => {
    try {
        const logs = await AuditLog.find().sort({ createdAt: 1 });

        let isValid = true;
        const errors = [];

        for (let i = 0; i < logs.length; i++) {
            const log = logs[i];

            // Verify hash
            const dataString = JSON.stringify({
                patient: log.patient,
                user: log.user,
                action: log.action,
                data: log.data,
                timestamp: log.createdAt,
                previousHash: log.previousHash
            });

            const calculatedHash = crypto
                .createHash('sha256')
                .update(dataString)
                .digest('hex');

            if (calculatedHash !== log.hash) {
                isValid = false;
                errors.push({
                    logId: log._id,
                    error: 'Hash mismatch',
                    expected: log.hash,
                    calculated: calculatedHash
                });
            }

            // Verify chain
            if (i > 0 && log.previousHash !== logs[i - 1].hash) {
                isValid = false;
                errors.push({
                    logId: log._id,
                    error: 'Chain broken',
                    expected: logs[i - 1].hash,
                    actual: log.previousHash
                });
            }
        }

        res.json({
            success: true,
            data: {
                isValid,
                totalLogs: logs.length,
                errors: errors.length > 0 ? errors : undefined
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
