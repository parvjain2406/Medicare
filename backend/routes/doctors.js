const express = require('express');
const router = express.Router();
const {
    getAllDoctors,
    getDoctorById,
    getSpecializations
} = require('../controllers/doctorController');

/**
 * Doctor Routes
 * Base path: /api/doctors
 */

// @route   GET /api/doctors/specializations
// @desc    Get all unique specializations
// @access  Public
router.get('/specializations', getSpecializations);

// @route   GET /api/doctors
// @desc    Get all doctors (with optional filters)
// @access  Public
router.get('/', getAllDoctors);

// @route   GET /api/doctors/:id
// @desc    Get doctor by ID
// @access  Public
router.get('/:id', getDoctorById);

module.exports = router;
