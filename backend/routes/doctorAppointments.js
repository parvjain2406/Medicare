const express = require('express');
const router = express.Router();
const { protectDoctor } = require('../middleware/authMiddleware');
const {
    getDoctorAppointments,
    getAppointmentById,
    updateAppointmentStatus,
    completeAppointment,
    getTodaySchedule,
    getAppointmentStats
} = require('../controllers/doctorAppointmentController');

/**
 * Doctor Appointment Routes
 * Base path: /api/doctor/appointments
 */

// @route   GET /api/doctor/appointments/stats
// @desc    Get appointment statistics for dashboard
// @access  Private (Doctor)
router.get('/stats', protectDoctor, getAppointmentStats);

// @route   GET /api/doctor/appointments/today
// @desc    Get today's schedule
// @access  Private (Doctor)
router.get('/today', protectDoctor, getTodaySchedule);

// @route   GET /api/doctor/appointments
// @desc    Get all appointments for logged in doctor
// @access  Private (Doctor)
router.get('/', protectDoctor, getDoctorAppointments);

// @route   GET /api/doctor/appointments/:id
// @desc    Get single appointment
// @access  Private (Doctor)
router.get('/:id', protectDoctor, getAppointmentById);

// @route   PUT /api/doctor/appointments/:id/status
// @desc    Update appointment status (Accept/Reject)
// @access  Private (Doctor)
router.put('/:id/status', protectDoctor, updateAppointmentStatus);

// @route   PUT /api/doctor/appointments/:id/complete
// @desc    Complete appointment with prescription
// @access  Private (Doctor)
router.put('/:id/complete', protectDoctor, completeAppointment);

module.exports = router;
