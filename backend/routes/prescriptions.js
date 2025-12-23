const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
    getPrescriptions,
    getPrescriptionById,
    getActivePrescriptionsCount
} = require('../controllers/prescriptionController');

/**
 * Prescription Routes
 * Base path: /api/prescriptions
 */

// @route   GET /api/prescriptions/active-count
// @desc    Get count of active prescriptions
// @access  Private
router.get('/active-count', protect, getActivePrescriptionsCount);

// @route   GET /api/prescriptions
// @desc    Get all prescriptions for logged in user
// @access  Private
router.get('/', protect, getPrescriptions);

// @route   GET /api/prescriptions/:id
// @desc    Get single prescription
// @access  Private
router.get('/:id', protect, getPrescriptionById);

module.exports = router;
