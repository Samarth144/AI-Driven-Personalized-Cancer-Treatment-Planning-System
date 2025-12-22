const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes - AUTHENTICATION DISABLED FOR DEVELOPMENT
exports.protect = async (req, res, next) => {
    // Authentication disabled - allow all requests
    // Create a mock user for development
    req.user = {
        id: 'dev-user-id',
        _id: 'dev-user-id',
        name: 'Development User',
        email: 'dev@example.com',
        role: 'oncologist'
    };

    next();
};

// Grant access to specific roles - AUTHORIZATION DISABLED FOR DEVELOPMENT
exports.authorize = (...roles) => {
    return (req, res, next) => {
        // Authorization disabled - allow all requests
        next();
    };
};
