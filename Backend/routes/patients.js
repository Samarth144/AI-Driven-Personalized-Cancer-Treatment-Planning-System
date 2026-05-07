const express = require('express');
const router = express.Router();
const {
    getPatients,
    getPatient,
    createPatient,
    updatePatient,
    deletePatient,
    analyzePathology,
    getAwarenessGuidance
} = require('../controllers/patientController');
const { protect, authorize } = require('../middleware/auth');

router.route('/')
    .get(protect, getPatients)
    .post(protect, authorize('oncologist', 'admin'), createPatient);

router.route('/:id')
    .get(protect, getPatient)
    .put(protect, authorize('oncologist', 'admin'), updatePatient)
    .delete(protect, authorize('oncologist', 'admin'), deletePatient);

router.post('/:id/analyze-pathology', protect, analyzePathology);
router.get('/:id/awareness', protect, getAwarenessGuidance);

// ─── New Awareness Features ──────────────────────────────────────────────────
const {
    submitDailyQuestionnaire,
    getDailyTasks,
    updateTaskStatus,
    getAdherenceHistory,
    resetDailyQuestionnaire,
    exportDailyPlan,
    exportLifestyleReport
} = require('../controllers/awarenessController');

router.post('/:id/awareness/questionnaire', protect, submitDailyQuestionnaire);
router.get('/:id/awareness/tasks', protect, getDailyTasks);
router.patch('/:id/awareness/tasks/:taskId', protect, updateTaskStatus);
router.get('/:id/awareness/adherence', protect, getAdherenceHistory);
router.post('/:id/awareness/reset-test', protect, resetDailyQuestionnaire);
router.get('/:id/awareness/export-plan', protect, exportDailyPlan);
router.get('/:id/awareness/lifestyle-report', protect, exportLifestyleReport);

module.exports = router;
