const express = require('express');
const multer = require('multer');
const path = require('path');
const { uploadHistopathologyReport } = require('../controllers/uploadController');

const router = express.Router();

// Configure multer for file storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '..', '..', 'reports'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

router.post('/histopathology', upload.single('histopathology_pdf'), uploadHistopathologyReport);

module.exports = router;