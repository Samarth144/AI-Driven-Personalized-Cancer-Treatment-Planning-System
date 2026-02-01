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
    data: {
        type: DataTypes.JSONB,
        defaultValue: {}
    },
    uploadedFiles: {
        type: DataTypes.JSONB,
        defaultValue: []
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
    },
    notes: {
        type: DataTypes.TEXT
    }
});

// Associations
Analysis.belongsTo(Patient, { foreignKey: 'patientId' });
Patient.hasMany(Analysis, { foreignKey: 'patientId' });

Analysis.belongsTo(User, { as: 'performedBy', foreignKey: 'performedById' });
User.hasMany(Analysis, { foreignKey: 'performedById' });

module.exports = Analysis;