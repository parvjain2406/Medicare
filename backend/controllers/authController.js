const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { asyncHandler } = require('../middleware/errorHandler');

/**
 * Generate JWT Token
 * @param {string} id - User ID
 * @returns {string} - JWT token
 */
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE || '7d'
    });
};

/**
 * @desc    Register new user
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = asyncHandler(async (req, res) => {
    const { name, email, mobile, password } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
        return res.status(400).json({
            success: false,
            message: 'Please provide name, email, and password'
        });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({
            success: false,
            message: 'Please provide a valid email address'
        });
    }

    // Validate password strength
    if (password.length < 6) {
        return res.status(400).json({
            success: false,
            message: 'Password must be at least 6 characters long'
        });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
        return res.status(400).json({
            success: false,
            message: 'User already exists with this email'
        });
    }

    // Create user
    const user = await User.create({
        name: name.trim(),
        email: email.toLowerCase().trim(),
        mobile: mobile ? mobile.trim() : '',
        password
    });

    // Generate token
    const token = generateToken(user._id);

    // Send response (exclude password)
    res.status(201).json({
        success: true,
        message: 'Registration successful',
        token,
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            mobile: user.mobile,
            dob: user.dob,
            role: user.role,
            createdAt: user.createdAt
        }
    });
});

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
        return res.status(400).json({
            success: false,
            message: 'Please provide email and password'
        });
    }

    // Find user by email and include password field
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user) {
        return res.status(401).json({
            success: false,
            message: 'Invalid credentials. User not found.'
        });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
        return res.status(401).json({
            success: false,
            message: 'Invalid credentials. Password is incorrect.'
        });
    }

    // Generate token
    const token = generateToken(user._id);

    // Send response
    res.status(200).json({
        success: true,
        message: 'Login successful',
        token,
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            mobile: user.mobile,
            dob: user.dob,
            role: user.role,
            createdAt: user.createdAt
        }
    });
});

/**
 * @desc    Get current logged in user
 * @route   GET /api/auth/me
 * @access  Private
 */
const getMe = asyncHandler(async (req, res) => {
    // req.user is set by protect middleware
    const user = await User.findById(req.user._id);

    if (!user) {
        return res.status(404).json({
            success: false,
            message: 'User not found'
        });
    }

    res.status(200).json({
        success: true,
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            mobile: user.mobile,
            dob: user.dob,
            role: user.role,
            createdAt: user.createdAt
        }
    });
});

/**
 * @desc    Update user profile (DOB and Mobile)
 * @route   PUT /api/auth/profile
 * @access  Private
 */
const updateProfile = asyncHandler(async (req, res) => {
    const { dob, mobile } = req.body;

    // Find user
    const user = await User.findById(req.user._id);

    if (!user) {
        return res.status(404).json({
            success: false,
            message: 'User not found'
        });
    }

    // Update fields if provided
    if (dob !== undefined) {
        user.dob = dob ? new Date(dob) : null;
    }

    if (mobile !== undefined) {
        user.mobile = mobile ? mobile.trim() : '';
    }

    await user.save();

    res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            mobile: user.mobile,
            dob: user.dob,
            role: user.role,
            createdAt: user.createdAt
        }
    });
});

module.exports = {
    register,
    login,
    getMe,
    updateProfile
};

