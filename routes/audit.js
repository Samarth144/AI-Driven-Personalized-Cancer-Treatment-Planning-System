const express = require('express');
const router = express.Router();
const {
    getAuditLogs,
    getPatientAuditLogs,
    verifyBlockchain
} = require('../controllers/auditController');
const { protect, authorize } = require('../middleware/auth');

router.route('/')
    .get(protect, authorize('admin', 'researcher'), getAuditLogs);

router.route('/patient/:patientId')
    .get(protect, getPatientAuditLogs);

router.route('/verify')
    .post(protect, authorize('admin', 'researcher'), verifyBlockchain);

module.exports = router;
