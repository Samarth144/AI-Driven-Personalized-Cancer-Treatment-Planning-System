const mongoose = require('mongoose');

const outcomePredictionSchema = new mongoose.Schema({
    patient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Patient',
        required: true
    },
    treatmentPlan: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TreatmentPlan'
    },
    overallSurvival: {
        median: {
            type: Number,
            required: true
        },
        range: {
            min: Number,
            max: Number
        },
        confidence: Number
    },
    progressionFreeSurvival: {
        median: {
            type: Number,
            required: true
        },
        range: {
            min: Number,
            max: Number
        },
        confidence: Number
    },
    sideEffects: {
        fatigue: Number,
        nausea: Number,
        cognitiveImpairment: Number,
        hematologicToxicity: Number,
        other: mongoose.Schema.Types.Mixed
    },
    qualityOfLife: {
        score: Number,
        timeline: [{
            month: Number,
            score: Number
        }]
    },
    modelVersion: {
        type: String,
        default: '1.0.0'
    },
    inputFeatures: {
        type: mongoose.Schema.Types.Mixed
    },
    generatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('OutcomePrediction', outcomePredictionSchema);
