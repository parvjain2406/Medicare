const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
    getRecords,
    getRecordById,
    getRecordStats
} = require('../controllers/recordController');

/**
 * Medical Records Routes
 * Base path: /api/records
 */

// @route   GET /api/records/stats
// @desc    Get record statistics
// @access  Private
router.get('/stats', protect, getRecordStats);

// @route   GET /api/records
// @desc    Get all medical records for logged in user
// @access  Private
router.get('/', protect, getRecords);

// @route   GET /api/records/:id
// @desc    Get single record
// @access  Private
router.get('/:id', protect, getRecordById);

module.exports = router;
