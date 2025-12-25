const express = require('express');
const router = express.Router();
const {
    doctorLogin,
    getDoctorProfile,
    updateDoctorProfile,
    changeDoctorPassword
} = require('../controllers/doctorAuthController');
const { protectDoctor } = require('../middleware/authMiddleware');

/**
 * Doctor Auth Routes
 * Base path: /api/doctor/auth
 */

// @route   POST /api/doctor/auth/login
// @desc    Login doctor and return token
// @access  Public
router.post('/login', doctorLogin);

// @route   GET /api/doctor/auth/me
// @desc    Get current logged in doctor
// @access  Private (Doctor)
router.get('/me', protectDoctor, getDoctorProfile);

// @route   PUT /api/doctor/auth/profile
// @desc    Update doctor profile
// @access  Private (Doctor)
router.put('/profile', protectDoctor, updateDoctorProfile);

// @route   PUT /api/doctor/auth/password
// @desc    Change doctor password
// @access  Private (Doctor)
router.put('/password', protectDoctor, changeDoctorPassword);

module.exports = router;
