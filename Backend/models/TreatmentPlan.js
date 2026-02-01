const mongoose = require('mongoose');

const treatmentPlanSchema = new mongoose.Schema({
    patient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Patient',
        required: true
    },
    recommendedProtocol: {
        type: String,
        required: [true, 'Please add recommended protocol']
    },
    confidence: {
        type: Number,
        required: true,
        min: 0,
        max: 100
    },
    alternativeOptions: [{
        protocol: String,
        confidence: Number,
        rationale: String
    }],
    guidelineAlignment: {
        type: String,
        enum: ['NCCN', 'EANO', 'ESMO', 'Other'],
        default: 'NCCN'
    },
    status: {
        type: String,
        enum: ['draft', 'proposed', 'approved', 'active', 'completed', 'discontinued'],
        default: 'proposed'
    },
    treatmentComponents: [{
        type: {
            type: String,
            enum: ['surgery', 'radiation', 'chemotherapy', 'immunotherapy', 'targeted_therapy', 'other']
        },
        description: String,
        startDate: Date,
        endDate: Date,
        dosage: String,
        frequency: String
    }],
    rationale: {
        type: String
    },
    expectedOutcomes: {
        type: mongoose.Schema.Types.Mixed
    },
    approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    approvalDate: {
        type: Date
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('TreatmentPlan', treatmentPlanSchema);
