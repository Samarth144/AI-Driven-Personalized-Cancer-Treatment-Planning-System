const multer = require('multer');
const path = require('path');
const AuditLog = require('../models/AuditLog');

// Configure storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// File filter
const fileFilter = (req, file, cb) => {
    // Accept images and common medical file formats
    const allowedTypes = /jpeg|jpg|png|gif|pdf|dcm|nii|nifti/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype) || file.mimetype === 'application/dicom';

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only images, PDFs, and medical imaging formats are allowed.'));
    }
};

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 100 * 1024 * 1024 // 100MB limit
    },
    fileFilter: fileFilter
});

// @desc    Upload file
// @route   POST /api/uploads
// @access  Private
exports.uploadFile = [
    upload.single('file'),
    async (req, res) => {
        try {
            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    message: 'Please upload a file'
                });
            }

            // Create audit log
            if (req.body.patientId) {
                const previousHash = await AuditLog.getLastHash();
                await AuditLog.create({
                    patient: req.body.patientId,
                    user: req.user.id,
                    action: 'file_uploaded',
                    data: {
                        filename: req.file.filename,
                        originalName: req.file.originalname,
                        size: req.file.size
                    },
                    previousHash,
                    ipAddress: req.ip,
                    userAgent: req.get('user-agent')
                });
            }

            res.json({
                success: true,
                data: {
                    filename: req.file.filename,
                    originalName: req.file.originalname,
                    path: req.file.path,
                    size: req.file.size,
                    mimetype: req.file.mimetype
                }
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
];

// @desc    Upload multiple files
// @route   POST /api/uploads/multiple
// @access  Private
exports.uploadMultipleFiles = [
    upload.array('files', 10),
    async (req, res) => {
        try {
            if (!req.files || req.files.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Please upload at least one file'
                });
            }

            const fileData = req.files.map(file => ({
                filename: file.filename,
                originalName: file.originalname,
                path: file.path,
                size: file.size,
                mimetype: file.mimetype
            }));

            res.json({
                success: true,
                count: req.files.length,
                data: fileData
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
];
