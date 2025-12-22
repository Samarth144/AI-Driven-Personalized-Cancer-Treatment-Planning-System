const express = require('express');
const router = express.Router();
const {
    getPatientTreatments,
    getTreatment,
    createTreatment,
    updateTreatment,
    approveTreatment
} = require('../controllers/treatmentController');
const { protect, authorize } = require('../middleware/auth');

router.route('/')
    .post(protect, authorize('oncologist', 'admin'), createTreatment);

router.route('/patient/:patientId')
    .get(protect, getPatientTreatments);

router.route('/:id')
    .get(protect, getTreatment)
    .put(protect, authorize('oncologist', 'admin'), updateTreatment);

router.route('/:id/approve')
    .post(protect, authorize('oncologist', 'admin'), approveTreatment);

module.exports = router;
