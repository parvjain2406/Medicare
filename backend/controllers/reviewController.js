const Review = require('../models/Review');
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');
const mongoose = require('mongoose');

// @desc    Create a new review
// @route   POST /api/reviews
// @access  Private (Patient only)
exports.createReview = async (req, res) => {
    try {
        const { rating, comment, doctorId, appointmentId } = req.body;

        // Validation
        if (!rating || !comment || !doctorId || !appointmentId) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all fields: rating, comment, doctorId, appointmentId'
            });
        }

        // Verify Appointment
        const appointment = await Appointment.findById(appointmentId);
        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: 'Appointment not found'
            });
        }

        // Check if appointment belongs to user
        if (appointment.patient.toString() !== req.user.id) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized to review this appointment'
            });
        }

        // Check if appointment is completed
        if (appointment.status !== 'Completed') {
            return res.status(400).json({
                success: false,
                message: 'You can only review completed appointments'
            });
        }

        // Check for existing review
        const existingReview = await Review.findOne({ appointment: appointmentId });
        if (existingReview) {
            return res.status(400).json({
                success: false,
                message: 'You have already reviewed this appointment'
            });
        }

        // Create Review
        const review = await Review.create({
            patient: req.user.id,
            doctor: doctorId,
            appointment: appointmentId,
            rating,
            comment
        });

        res.status(201).json({
            success: true,
            data: review
        });

    } catch (error) {
        console.error('Create Review Error:', error);
        res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
};

// @desc    Get reviews for a doctor
// @route   GET /api/reviews/:doctorId
// @access  Public
exports.getDoctorReviews = async (req, res) => {
    try {
        const reviews = await Review.find({ doctor: req.params.doctorId })
            .populate('patient', 'name')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: reviews.length,
            data: reviews
        });
    } catch (error) {
        console.error('Get Reviews Error:', error);
        res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
};
