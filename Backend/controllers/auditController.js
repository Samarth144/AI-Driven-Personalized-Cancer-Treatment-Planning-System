const AuditLog = require('../models/AuditLog');
const User = require('../models/User');
const Patient = require('../models/Patient');
const crypto = require('crypto');

// @desc    Get all audit logs
// @route   GET /api/audit
// @access  Private (Admin/Researcher)
exports.getAuditLogs = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const offset = (page - 1) * limit;

        const { count, rows: logs } = await AuditLog.findAndCountAll({
            include: [
                { model: User, attributes: ['name', 'email', 'role'] },
                { model: Patient, attributes: ['firstName', 'lastName', 'mrn'] }
            ],
            order: [['createdAt', 'DESC']],
            limit,
            offset
        });

        res.json({
            success: true,
            count: logs.length,
            total: count,
            page,
            pages: Math.ceil(count / limit),
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
        const logs = await AuditLog.findAll({
            where: { patientId: req.params.patientId },
            include: [
                { model: User, attributes: ['name', 'email', 'role'] }
            ],
            order: [['createdAt', 'DESC']]
        });

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
        const logs = await AuditLog.findAll({ order: [['createdAt', 'ASC']] });

        let isValid = true;
        const errors = [];

        for (let i = 0; i < logs.length; i++) {
            const log = logs[i];

            // Verify hash (match the hook logic)
            const dataString = JSON.stringify({
                patientId: log.patientId,
                userId: log.userId,
                action: log.action,
                data: log.data,
                previousHash: log.previousHash
            });

            const calculatedHash = crypto
                .createHash('sha256')
                .update(dataString)
                .digest('hex');

            if (calculatedHash !== log.hash) {
                isValid = false;
                errors.push({
                    logId: log.id,
                    error: 'Hash mismatch',
                    expected: log.hash,
                    calculated: calculatedHash
                });
            }

            // Verify chain
            if (i > 0 && log.previousHash !== logs[i - 1].hash) {
                isValid = false;
                errors.push({
                    logId: log.id,
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