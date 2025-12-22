const mongoose = require('mongoose');

const analysisSchema = new mongoose.Schema({
    patient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Patient',
        required: true
    },
    analysisType: {
        type: String,
        enum: ['mri', 'genomic', 'histopathology'],
        required: [true, 'Please specify analysis type']
    },
    status: {
        type: String,
        enum: ['pending', 'processing', 'completed', 'failed'],
        default: 'pending'
    },
    data: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    uploadedFiles: [{
        filename: String,
        originalName: String,
        path: String,
        size: Number,
        uploadDate: {
            type: Date,
            default: Date.now
        }
    }],
    processingTime: {
        type: Number // in milliseconds
    },
    confidence: {
        type: Number,
        min: 0,
        max: 100
    },
    notes: {
        type: String
    },
    performedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

// Index for faster queries
analysisSchema.index({ patient: 1, analysisType: 1 });

module.exports = mongoose.model('Analysis', analysisSchema);
