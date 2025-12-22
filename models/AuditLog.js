const mongoose = require('mongoose');
const crypto = require('crypto');

const auditLogSchema = new mongoose.Schema({
    patient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Patient'
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    action: {
        type: String,
        required: [true, 'Please specify action'],
        enum: [
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
        ]
    },
    data: {
        type: mongoose.Schema.Types.Mixed
    },
    hash: {
        type: String,
        required: true
    },
    previousHash: {
        type: String,
        default: '0'
    },
    ipAddress: {
        type: String
    },
    userAgent: {
        type: String
    }
}, {
    timestamps: true
});

// Generate hash before saving
auditLogSchema.pre('save', async function (next) {
    if (!this.hash) {
        const dataString = JSON.stringify({
            patient: this.patient,
            user: this.user,
            action: this.action,
            data: this.data,
            timestamp: this.createdAt,
            previousHash: this.previousHash
        });

        this.hash = crypto
            .createHash('sha256')
            .update(dataString)
            .digest('hex');
    }
    next();
});

// Static method to get last hash
auditLogSchema.statics.getLastHash = async function () {
    const lastLog = await this.findOne().sort({ createdAt: -1 });
    return lastLog ? lastLog.hash : '0';
};

module.exports = mongoose.model('AuditLog', auditLogSchema);
