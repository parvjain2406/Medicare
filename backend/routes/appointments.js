const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
    getAppointments,
    getAppointmentById,
    createAppointment,
    updateAppointment,
    cancelAppointment,
    getAvailableSlots
} = require('../controllers/appointmentController');

/**
 * Appointment Routes
 * Base path: /api/appointments
 */

// @route   GET /api/appointments/slots/:doctorId/:date
// @desc    Get available slots for a doctor on a date
// @access  Public
router.get('/slots/:doctorId/:date', getAvailableSlots);

// @route   GET /api/appointments
// @desc    Get all appointments for logged in user
// @access  Private
router.get('/', protect, getAppointments);

// @route   GET /api/appointments/:id
// @desc    Get single appointment
// @access  Private
router.get('/:id', protect, getAppointmentById);

// @route   POST /api/appointments
// @desc    Create new appointment
// @access  Private
router.post('/', protect, createAppointment);

// @route   PUT /api/appointments/:id
// @desc    Update appointment
// @access  Private
router.put('/:id', protect, updateAppointment);

// @route   DELETE /api/appointments/:id
// @desc    Cancel appointment
// @access  Private
router.delete('/:id', protect, cancelAppointment);

module.exports = router;
