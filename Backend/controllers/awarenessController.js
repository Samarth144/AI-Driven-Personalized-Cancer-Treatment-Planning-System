const Patient = require('../models/Patient');
const DailyLog = require('../models/DailyLog');
const DailyTask = require('../models/DailyTask');
const PatientAlert = require('../models/PatientAlert');
const { generateDailyTasks } = require('../utils/awarenessEngine');
const { sequelize } = require('../config/db');
const { Op } = require('sequelize');

// @desc    Submit daily questionnaire and generate tasks
// @route   POST /api/patients/:id/awareness/questionnaire
// @access  Private
exports.submitDailyQuestionnaire = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const { fuelStatus, fuelComment, symptoms, energyLevel, priorityConcern } = req.body;
        const patientId = req.params.id;
        const today = new Date().toISOString().split('T')[0];

        const patient = await Patient.findByPk(patientId);
        if (!patient) {
            return res.status(404).json({ success: false, message: 'Patient not found' });
        }

        // 1. Save Daily Log
        const log = await DailyLog.create({
            patientId,
            date: today,
            fuelStatus,
            fuelComment,
            symptoms,
            energyLevel,
            priorityConcern
        }, { transaction });

        // 2. Update Patient lastQuestionnaireDate
        await patient.update({ lastQuestionnaireDate: today }, { transaction });

        // 3. Check for Critical Symptoms (Fever, Severe Pain, etc.)
        const criticalKeywords = ['fever', 'severe pain', 'breathing', 'seizure', 'unconscious', 'confusion'];
        const symptomLower = (symptoms || '').toLowerCase();
        const isCritical = criticalKeywords.some(kw => symptomLower.includes(kw));

        if (isCritical) {
            await PatientAlert.create({
                patientId,
                oncologistId: patient.oncologistId,
                priority: 'CRITICAL',
                type: 'SYMPTOM',
                message: `CRITICAL SYMPTOM REPORTED: ${symptoms}`
            }, { transaction });
        }

        // 3.5 Fetch Yesterday's Log for Trend Analysis
        const yesterdayDate = new Date();
        yesterdayDate.setDate(yesterdayDate.getDate() - 1);
        const yesterdayStr = yesterdayDate.toISOString().split('T')[0];
        const yesterdayLog = await DailyLog.findOne({
            where: { patientId, date: yesterdayStr }
        });

        // 4. Generate Daily Tasks via Groq (passing yesterday's context)
        const tasksData = await generateDailyTasks(patient, req.body, yesterdayLog);

        // 5. Save Tasks to DB
        const tasksToCreate = [];
        ['morning', 'afternoon', 'evening'].forEach(time => {
            if (tasksData[time]) {
                tasksData[time].forEach(t => {
                    tasksToCreate.push({
                        patientId,
                        date: today,
                        timeOfDay: time,
                        title: t.title,
                        description: t.description,
                        whyItMatters: t.whyItMatters,
                        isCritical: t.isCritical || false
                    });
                });
            }
        });

        await DailyTask.bulkCreate(tasksToCreate, { transaction });

        await transaction.commit();

        res.status(201).json({
            success: true,
            data: {
                log,
                tasks: tasksToCreate
            }
        });

    } catch (error) {
        await transaction.rollback();
        console.error("Error in submitDailyQuestionnaire:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get daily tasks for a patient
// @route   GET /api/patients/:id/awareness/tasks
// @access  Private
exports.getDailyTasks = async (req, res) => {
    try {
        const today = new Date().toISOString().split('T')[0];
        const tasks = await DailyTask.findAll({
            where: {
                patientId: req.params.id,
                date: today
            },
            order: [
                [sequelize.literal("CASE WHEN \"timeOfDay\" = 'morning' THEN 1 WHEN \"timeOfDay\" = 'afternoon' THEN 2 ELSE 3 END"), 'ASC']
            ]
        });

        res.json({ success: true, data: tasks });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update task completion status
// @route   PATCH /api/patients/:id/awareness/tasks/:taskId
// @access  Private
exports.updateTaskStatus = async (req, res) => {
    try {
        const { isCompleted } = req.body;
        const task = await DailyTask.findByPk(req.params.taskId);

        if (!task) {
            return res.status(404).json({ success: false, message: 'Task not found' });
        }

        await task.update({
            isCompleted,
            completedAt: isCompleted ? new Date() : null
        });

        // Trigger adherence check logic here (async)
        checkAdherenceAndAlert(task.patientId);

        res.json({ success: true, data: task });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get adherence history for 30 days
// @route   GET /api/patients/:id/awareness/adherence
// @access  Private
exports.getAdherenceHistory = async (req, res) => {
    try {
        const patientId = req.params.id;
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const tasks = await DailyTask.findAll({
            where: {
                patientId,
                date: { [Op.gte]: thirtyDaysAgo.toISOString().split('T')[0] }
            },
            attributes: ['date', 'isCompleted']
        });

        // Group by date and calculate score
        const history = {};
        tasks.forEach(t => {
            if (!history[t.date]) history[t.date] = { total: 0, completed: 0 };
            history[t.date].total++;
            if (t.isCompleted) history[t.date].completed++;
        });

        const formattedHistory = Object.keys(history).map(date => ({
            date,
            score: Math.round((history[date].completed / history[date].total) * 100),
            tasks: history[date]
        }));

        const alerts = await PatientAlert.findAll({
            where: {
                patientId,
                timestamp: { [Op.gte]: thirtyDaysAgo }
            },
            order: [['timestamp', 'DESC']]
        });

        res.json({ success: true, data: formattedHistory, alerts });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const { generateDailyPlanPDF, generateLifestyleReportPDF } = require('../utils/pdfGenerator');

// @desc    Export today's plan as PDF
// @route   GET /api/patients/:id/awareness/export-plan
// @access  Private
exports.exportDailyPlan = async (req, res) => {
    try {
        const patient = await Patient.findByPk(req.params.id);
        const today = new Date().toISOString().split('T')[0];
        const tasks = await DailyTask.findAll({
            where: { patientId: req.params.id, date: today }
        });

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=DailyPlan_${patient.lastName}_${today}.pdf`);

        generateDailyPlanPDF(patient, tasks, res);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Export 30-day lifestyle report for oncologist
// @route   GET /api/patients/:id/awareness/lifestyle-report
// @access  Private
exports.exportLifestyleReport = async (req, res) => {
    try {
        const patient = await Patient.findByPk(req.params.id);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const tasks = await DailyTask.findAll({
            where: {
                patientId: req.params.id,
                date: { [Op.gte]: thirtyDaysAgo.toISOString().split('T')[0] }
            }
        });

        const alerts = await PatientAlert.findAll({
            where: {
                patientId: req.params.id,
                timestamp: { [Op.gte]: thirtyDaysAgo }
            },
            order: [['timestamp', 'DESC']]
        });

        // Calculate history for report
        const historyMap = {};
        tasks.forEach(t => {
            if (!historyMap[t.date]) historyMap[t.date] = { total: 0, completed: 0 };
            historyMap[t.date].total++;
            if (t.isCompleted) historyMap[t.date].completed++;
        });

        const history = Object.keys(historyMap).map(date => ({
            date,
            score: Math.round((historyMap[date].completed / historyMap[date].total) * 100),
            tasks: historyMap[date]
        }));

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=LifestyleReport_${patient.lastName}.pdf`);

        generateLifestyleReportPDF(patient, history, alerts, res);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get alerts for the oncologist
// @route   GET /api/dashboard/alerts
// @access  Private (Doctor/Admin)
exports.getDoctorAlerts = async (req, res) => {
    try {
        const alerts = await PatientAlert.findAll({
            where: {
                oncologistId: req.user.id,
                isRead: false
            },
            include: [{
                model: Patient,
                attributes: ['firstName', 'lastName', 'mrn']
            }],
            order: [['timestamp', 'DESC']]
        });

        res.json({ success: true, data: alerts });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Helper to check adherence and trigger alerts if needed.
 */
async function checkAdherenceAndAlert(patientId) {
    try {
        const patient = await Patient.findByPk(patientId);
        if (!patient) return;

        // Check last 3 days
        const last3Days = [];
        for (let i = 0; i < 3; i++) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            last3Days.push(d.toISOString().split('T')[0]);
        }

        const taskStats = await DailyTask.findAll({
            where: {
                patientId,
                date: { [Op.in]: last3Days }
            },
            attributes: ['date', 'isCompleted']
        });

        const dayAdherence = {};
        taskStats.forEach(t => {
            if (!dayAdherence[t.date]) dayAdherence[t.date] = { total: 0, completed: 0 };
            dayAdherence[t.date].total++;
            if (t.isCompleted) dayAdherence[t.date].completed++;
        });

        const consistentlyLow = Object.values(dayAdherence).every(stats => (stats.completed / stats.total) < 0.3);

        if (consistentlyLow && Object.keys(dayAdherence).length === 3) {
            // Check if alert already exists for today to avoid spam
            const today = new Date().toISOString().split('T')[0];
            const existingAlert = await PatientAlert.findOne({
                where: {
                    patientId,
                    type: 'ADHERENCE',
                    timestamp: { [Op.gte]: today }
                }
            });

            if (!existingAlert) {
                await PatientAlert.create({
                    patientId,
                    oncologistId: patient.oncologistId,
                    priority: 'WATCH',
                    type: 'ADHERENCE',
                    message: `${patient.firstName} has completed less than 30% of their daily wellness plan for 3 consecutive days.`
                });
            }
        }
    } catch (err) {
        console.error("Adherence check error:", err);
    }
}

// @desc    DEV ONLY: Reset today's questionnaire to allow re-testing
// @route   POST /api/patients/:id/awareness/reset-test
// @access  Private
exports.resetDailyQuestionnaire = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const patientId = req.params.id;
        const today = new Date().toISOString().split('T')[0];

        // 1. Delete today's logs
        await DailyLog.destroy({ where: { patientId, date: today }, transaction });

        // 2. Delete today's tasks
        await DailyTask.destroy({ where: { patientId, date: today }, transaction });

        // 3. Reset patient lastQuestionnaireDate to null
        const patient = await Patient.findByPk(patientId);
        if (patient) {
            await patient.update({ lastQuestionnaireDate: null }, { transaction });
        }

        await transaction.commit();
        res.json({ success: true, message: "Dev Reset Successful. Refresh to see modal." });
    } catch (error) {
        await transaction.rollback();
        res.status(500).json({ success: false, message: error.message });
    }
};
