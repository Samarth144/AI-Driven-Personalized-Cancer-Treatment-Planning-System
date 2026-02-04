const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const Patient = require('./Patient');
const User = require('./User');

const Analysis = sequelize.define('Analysis', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    analysisType: {
        type: DataTypes.ENUM('mri', 'genomic', 'histopathology'),
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('pending', 'processing', 'completed', 'failed'),
        defaultValue: 'pending'
    },
    t1Path: { type: DataTypes.STRING, allowNull: true },
    t1cePath: { type: DataTypes.STRING, allowNull: true },
    t2Path: { type: DataTypes.STRING, allowNull: true },
    flairPath: { type: DataTypes.STRING, allowNull: true },
    // Dedicated MRI Extracted Columns
    tumorVolume: {
        type: DataTypes.FLOAT, // cm3
        allowNull: true
    },
    edemaVolume: {
        type: DataTypes.FLOAT, // cm3
        allowNull: true
    },
    tumorLocation: {
        type: DataTypes.STRING,
        allowNull: true
    },
    // Detailed Radiomics
    intensityStats: {
        type: DataTypes.JSONB,
        defaultValue: {}
    },
    textureFeatures: {
        type: DataTypes.JSONB,
        defaultValue: {}
    },
    // Full raw data for future-proofing
    data: {
        type: DataTypes.JSONB,
        defaultValue: {}
    },
    processingTime: {
        type: DataTypes.INTEGER
    },
    confidence: {
        type: DataTypes.FLOAT,
        validate: {
            min: 0,
            max: 100
        }
    }
});

// Associations
Analysis.belongsTo(Patient, { foreignKey: 'patientId' });
Patient.hasMany(Analysis, { foreignKey: 'patientId' });

Analysis.belongsTo(User, { as: 'performedBy', foreignKey: 'performedById' });
User.hasMany(Analysis, { foreignKey: 'performedById' });

module.exports = Analysis;