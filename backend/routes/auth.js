const express = require('express');
const router = express.Router();
const { register, login, getMe, updateProfile } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

/**
 * Auth Routes
 * Base path: /api/auth
 */

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', register);

// @route   POST /api/auth/login
// @desc    Login user and return token
// @access  Public
router.post('/login', login);

// @route   GET /api/auth/me
// @desc    Get current logged in user
// @access  Private (requires valid JWT)
router.get('/me', protect, getMe);

// @route   PUT /api/auth/profile
// @desc    Update user profile (DOB and Mobile)
// @access  Private (requires valid JWT)
router.put('/profile', protect, updateProfile);

module.exports = router;

