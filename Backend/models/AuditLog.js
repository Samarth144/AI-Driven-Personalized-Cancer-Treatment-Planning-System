const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const Patient = require('./Patient');
const User = require('./User');
const crypto = require('crypto');

const AuditLog = sequelize.define('AuditLog', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    action: {
        type: DataTypes.ENUM(
            'patient_created',
            'patient_updated',
            'patient_deleted',
            'analysis_created',
            'analysis_updated',
            'treatment_created',
            'treatment_updated',
            'treatment_approved',
            'outcome_generated',
            'file_uploaded',
            'user_login',
            'user_logout',
            'other'
        ),
        allowNull: false
    },
    data: {
        type: DataTypes.JSONB
    },
    hash: {
        type: DataTypes.STRING,
        unique: true
    },
    previousHash: {
        type: DataTypes.STRING,
        defaultValue: '0'
    },
    ipAddress: {
        type: DataTypes.STRING
    },
    userAgent: {
        type: DataTypes.STRING
    }
}, {
    hooks: {
        beforeSave: async (log) => {
            if (!log.hash) {
                const dataString = JSON.stringify({
                    patientId: log.patientId,
                    userId: log.userId,
                    action: log.action,
                    data: log.data,
                    previousHash: log.previousHash
                });

                log.hash = crypto
                    .createHash('sha256')
                    .update(dataString)
                    .digest('hex');
            }
        }
    }
});

// Associations
AuditLog.belongsTo(Patient, { foreignKey: 'patientId' });
Patient.hasMany(AuditLog, { foreignKey: 'patientId' });

AuditLog.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(AuditLog, { foreignKey: 'userId' });

// Static method
AuditLog.getLastHash = async function () {
    const lastLog = await this.findOne({
        order: [['createdAt', 'DESC']]
    });
    return lastLog ? lastLog.hash : '0';
};

module.exports = AuditLog;