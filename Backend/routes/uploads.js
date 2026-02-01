const express = require('express');
const router = express.Router();
const { uploadFile, uploadMultipleFiles } = require('../controllers/uploadController');
const { protect } = require('../middleware/auth');

router.post('/', protect, uploadFile);
router.post('/multiple', protect, uploadMultipleFiles);

module.exports = router;
