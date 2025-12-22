const express = require('express');
const router = express.Router();
const {
    getPatientOutcomes,
    getOutcome,
    createOutcome
} = require('../controllers/outcomeController');
const { protect } = require('../middleware/auth');

router.route('/')
    .post(protect, createOutcome);

router.route('/patient/:patientId')
    .get(protect, getPatientOutcomes);

router.route('/:id')
    .get(protect, getOutcome);

module.exports = router;
