const express = require('express');
const router = express.Router();
const {
    getStats,
    getRecentPatients,
    getRecentAnalyses
} = require('../controllers/dashboardController');
const { protect } = require('../middleware/auth');

router.get('/stats', protect, getStats);
router.get('/recent-patients', protect, getRecentPatients);
router.get('/recent-analyses', protect, getRecentAnalyses);

module.exports = router;
