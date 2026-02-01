const Analysis = require('../models/Analysis');
const AuditLog = require('../models/AuditLog');
const { generateMockAnalysis, simulateProcessing } = require('../utils/aiSimulator');

// @desc    Get all analyses for a patient
// @route   GET /api/analyses/patient/:patientId
// @access  Private
exports.getPatientAnalyses = async (req, res) => {
    try {
        const analyses = await Analysis.find({ patient: req.params.patientId })
            .populate('performedBy', 'name email')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: analyses.length,
            data: analyses
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get single analysis
// @route   GET /api/analyses/:id
// @access  Private
exports.getAnalysis = async (req, res) => {
    try {
        const analysis = await Analysis.findById(req.params.id)
            .populate('patient', 'firstName lastName mrn')
            .populate('performedBy', 'name email');

        if (!analysis) {
            return res.status(404).json({
                success: false,
                message: 'Analysis not found'
            });
        }

        res.json({
            success: true,
            data: analysis
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Create new analysis
// @route   POST /api/analyses
// @access  Private
exports.createAnalysis = async (req, res) => {
    try {
        req.body.performedBy = req.user.id;

        const analysis = await Analysis.create(req.body);

        // Create audit log
        const previousHash = await AuditLog.getLastHash();
        await AuditLog.create({
            patient: analysis.patient,
            user: req.user.id,
            action: 'analysis_created',
            data: { analysisType: analysis.analysisType, analysisId: analysis._id },
            previousHash,
            ipAddress: req.ip,
            userAgent: req.get('user-agent')
        });

        res.status(201).json({
            success: true,
            data: analysis
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Process analysis (simulate AI processing)
// @route   POST /api/analyses/:id/process
// @access  Private
exports.processAnalysis = async (req, res) => {
    try {
        let analysis = await Analysis.findById(req.params.id);

        if (!analysis) {
            return res.status(404).json({
                success: false,
                message: 'Analysis not found'
            });
        }

        // Update status to processing
        analysis.status = 'processing';
        await analysis.save();

        // Simulate AI processing
        const startTime = Date.now();
        await simulateProcessing(3000); // 3 seconds processing time

        // Generate mock analysis results
        const results = generateMockAnalysis(analysis.analysisType);

        analysis.data = results;
        analysis.status = 'completed';
        analysis.processingTime = Date.now() - startTime;
        analysis.confidence = parseFloat(results.segmentationConfidence || results.confidence || (Math.random() * 20 + 80).toFixed(1));

        await analysis.save();

        // Create audit log
        const previousHash = await AuditLog.getLastHash();
        await AuditLog.create({
            patient: analysis.patient,
            user: req.user.id,
            action: 'analysis_updated',
            data: { analysisType: analysis.analysisType, status: 'completed' },
            previousHash,
            ipAddress: req.ip,
            userAgent: req.get('user-agent')
        });

        res.json({
            success: true,
            data: analysis
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Update analysis
// @route   PUT /api/analyses/:id
// @access  Private
exports.updateAnalysis = async (req, res) => {
    try {
        let analysis = await Analysis.findById(req.params.id);

        if (!analysis) {
            return res.status(404).json({
                success: false,
                message: 'Analysis not found'
            });
        }

        analysis = await Analysis.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.json({
            success: true,
            data: analysis
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
