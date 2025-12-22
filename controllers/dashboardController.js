const Patient = require('../models/Patient');
const Analysis = require('../models/Analysis');
const TreatmentPlan = require('../models/TreatmentPlan');

// @desc    Get dashboard statistics
// @route   GET /api/dashboard/stats
// @access  Private
exports.getStats = async (req, res) => {
    try {
        const totalPatients = await Patient.countDocuments();
        const totalAnalyses = await Analysis.countDocuments();
        const completedAnalyses = await Analysis.countDocuments({ status: 'completed' });
        const activeTreatments = await TreatmentPlan.countDocuments({ status: 'active' });

        // Get recent activity count (last 7 days)
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const recentPatients = await Patient.countDocuments({ createdAt: { $gte: sevenDaysAgo } });
        const recentAnalyses = await Analysis.countDocuments({ createdAt: { $gte: sevenDaysAgo } });

        // Analysis type breakdown
        const analysisByType = await Analysis.aggregate([
            { $group: { _id: '$analysisType', count: { $sum: 1 } } }
        ]);

        // Treatment status breakdown
        const treatmentsByStatus = await TreatmentPlan.aggregate([
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]);

        res.json({
            success: true,
            data: {
                overview: {
                    totalPatients,
                    totalAnalyses,
                    completedAnalyses,
                    activeTreatments
                },
                recentActivity: {
                    newPatients: recentPatients,
                    newAnalyses: recentAnalyses
                },
                analysisByType,
                treatmentsByStatus
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get recent patients
// @route   GET /api/dashboard/recent-patients
// @access  Private
exports.getRecentPatients = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 5;

        const patients = await Patient.find()
            .populate('oncologist', 'name')
            .sort({ createdAt: -1 })
            .limit(limit);

        res.json({
            success: true,
            data: patients
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get recent analyses
// @route   GET /api/dashboard/recent-analyses
// @access  Private
exports.getRecentAnalyses = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 5;

        const analyses = await Analysis.find()
            .populate('patient', 'firstName lastName mrn')
            .populate('performedBy', 'name')
            .sort({ createdAt: -1 })
            .limit(limit);

        res.json({
            success: true,
            data: analyses
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
