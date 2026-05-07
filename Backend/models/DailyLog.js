const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const Patient = require('./Patient');

const DailyLog = sequelize.define('DailyLog', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    patientId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'Patients',
            key: 'id'
        }
    },
    date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    fuelStatus: {
        type: DataTypes.ENUM('good', 'difficult', 'struggling'),
        allowNull: false
    },
    fuelComment: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    symptoms: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    energyLevel: {
        type: DataTypes.INTEGER,
        validate: { min: 1, max: 5 }
    },
    priorityConcern: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    timestamp: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
});

// Associations
DailyLog.belongsTo(Patient, { foreignKey: 'patientId' });
Patient.hasMany(DailyLog, { foreignKey: 'patientId' });

module.exports = DailyLog;