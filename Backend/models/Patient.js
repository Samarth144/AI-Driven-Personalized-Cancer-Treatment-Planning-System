const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
    mrn: {
        type: String,
        required: [true, 'Please add a Medical Record Number'],
        unique: true
    },
    firstName: {
        type: String,
        required: [true, 'Please add first name'],
        trim: true
    },
    lastName: {
        type: String,
        required: [true, 'Please add last name'],
        trim: true
    },
    dateOfBirth: {
        type: Date,
        required: [true, 'Please add date of birth']
    },
    gender: {
        type: String,
        enum: ['male', 'female', 'other'],
        required: [true, 'Please add gender']
    },
    email: {
        type: String,
        lowercase: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please add a valid email'
        ]
    },
    phone: {
        type: String
    },
    diagnosis: {
        type: String,
        required: [true, 'Please add diagnosis']
    },
    diagnosisDate: {
        type: Date,
        required: [true, 'Please add diagnosis date']
    },
    performanceStatus: {
        type: String,
        enum: ['0', '1', '2', '3', '4'],
        default: '1'
    },
    medicalHistory: {
        type: String
    },
    currentMedications: [{
        name: String,
        dosage: String
    }],
    allergies: [String],
    oncologist: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Patient', patientSchema);
