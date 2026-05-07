const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const Patient = require('./Patient');
const User = require('./User');

const PatientAlert = sequelize.define('PatientAlert', {
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
    oncologistId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'id'
        }
    },
    priority: {
        type: DataTypes.ENUM('CRITICAL', 'WATCH', 'INFO'),
        allowNull: false
    },
    type: {
        type: DataTypes.STRING,
        allowNull: false
    },
    message: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    isRead: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    timestamp: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
});

// Associations
PatientAlert.belongsTo(Patient, { foreignKey: 'patientId' });
Patient.hasMany(PatientAlert, { foreignKey: 'patientId' });

PatientAlert.belongsTo(User, { as: 'oncologist', foreignKey: 'oncologistId' });
User.hasMany(PatientAlert, { foreignKey: 'oncologistId' });

module.exports = PatientAlert;