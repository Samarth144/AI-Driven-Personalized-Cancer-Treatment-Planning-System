const Analysis = require('../models/Analysis');
const Patient = require('../models/Patient');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const { generateMockAnalysis, simulateProcessing } = require('../utils/aiSimulator');

// @desc    Get all analyses for a patient
// @route   GET /api/analyses/patient/:patientId
// @access  Private
exports.getPatientAnalyses = async (req, res) => {
    try {
        const analyses = await Analysis.findAll({
            where: { patientId: req.params.patientId },
            include: [{
                model: User,
                as: 'performedBy',
                attributes: ['name', 'email']
            }],
            order: [['createdAt', 'DESC']]
        });

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
        const analysis = await Analysis.findByPk(req.params.id, {
            include: [
                {
                    model: Patient,
                    attributes: ['firstName', 'lastName', 'mrn']
                },
                {
                    model: User,
                    as: 'performedBy',
                    attributes: ['name', 'email']
                }
            ]
        });

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
        req.body.performedById = req.user.id;

        const analysis = await Analysis.create(req.body);

        // Create audit log
        const previousHash = await AuditLog.getLastHash();
        await AuditLog.create({
            patientId: analysis.patientId,
            userId: req.user.id,
            action: 'analysis_created',
            data: { analysisType: analysis.analysisType, analysisId: analysis.id },
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
        let analysis = await Analysis.findByPk(req.params.id);

        if (!analysis) {
            return res.status(404).json({
                success: false,
                message: 'Analysis not found'
            });
        }

        // Update status to processing
        await analysis.update({ status: 'processing' });

        // Simulate AI processing
        const startTime = Date.now();
        await simulateProcessing(3000); // 3 seconds processing time

        // Generate mock analysis results
        const results = generateMockAnalysis(analysis.analysisType);

        await analysis.update({
            data: results,
            status: 'completed',
            processingTime: Date.now() - startTime,
            confidence: parseFloat(results.segmentationConfidence || results.confidence || (Math.random() * 20 + 80).toFixed(1))
        });

        // Create audit log
        const previousHash = await AuditLog.getLastHash();
        await AuditLog.create({
            patientId: analysis.patientId,
            userId: req.user.id,
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
        let analysis = await Analysis.findByPk(req.params.id);

        if (!analysis) {
            return res.status(404).json({
                success: false,
                message: 'Analysis not found'
            });
        }

        await analysis.update(req.body);

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