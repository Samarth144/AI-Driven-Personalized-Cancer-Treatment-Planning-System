const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const Patient = require('./Patient');

const DailyTask = sequelize.define('DailyTask', {
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
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    timeOfDay: {
        type: DataTypes.ENUM('morning', 'afternoon', 'evening'),
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    whyItMatters: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    isCompleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    completedAt: {
        type: DataTypes.DATE,
        allowNull: true
    },
    isCritical: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
});

// Associations
DailyTask.belongsTo(Patient, { foreignKey: 'patientId' });
Patient.hasMany(DailyTask, { foreignKey: 'patientId' });

module.exports = DailyTask;