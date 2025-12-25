const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Doctor = require('../models/Doctor');

/**
 * Middleware to protect routes for patients/users
 * Verifies JWT token and attaches user to request
 */
const protect = async (req, res, next) => {
    let token;

    // Check for token in Authorization header
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        // Extract token from "Bearer <token>"
        token = req.headers.authorization.split(' ')[1];
    }

    // Check if token exists
    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Not authorized to access this route. No token provided.'
        });
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Find user by ID from token payload
        const user = await User.findById(decoded.id);

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'User not found. Token is invalid.'
            });
        }

        // Attach user to request object
        req.user = user;
        next();
    } catch (error) {
        // Handle specific JWT errors
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Invalid token. Please log in again.'
            });
        }

        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token has expired. Please log in again.'
            });
        }

        return res.status(401).json({
            success: false,
            message: 'Not authorized to access this route.'
        });
    }
};

/**
 * Middleware to protect routes for doctors
 * Verifies JWT token and attaches doctor to request
 */
const protectDoctor = async (req, res, next) => {
    let token;

    // Check for token in Authorization header
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        // Extract token from "Bearer <token>"
        token = req.headers.authorization.split(' ')[1];
    }

    // Check if token exists
    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Not authorized to access this route. No token provided.'
        });
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Check if this is a doctor token
        if (decoded.role !== 'doctor') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Doctor credentials required.'
            });
        }

        // Find doctor by ID from token payload
        const doctor = await Doctor.findById(decoded.id);

        if (!doctor) {
            return res.status(401).json({
                success: false,
                message: 'Doctor not found. Token is invalid.'
            });
        }

        // Check if doctor is active
        if (!doctor.isActive) {
            return res.status(403).json({
                success: false,
                message: 'Doctor account is deactivated.'
            });
        }

        // Attach doctor to request object
        req.doctor = doctor;
        next();
    } catch (error) {
        // Handle specific JWT errors
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Invalid token. Please log in again.'
            });
        }

        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token has expired. Please log in again.'
            });
        }

        return res.status(401).json({
            success: false,
            message: 'Not authorized to access this route.'
        });
    }
};

/**
 * Middleware to authorize specific roles
 * @param  {...string} roles - Allowed roles
 */
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `User role '${req.user.role}' is not authorized to access this route`
            });
        }
        next();
    };
};

module.exports = { protect, protectDoctor, authorize };
