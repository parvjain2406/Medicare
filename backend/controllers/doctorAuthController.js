const jwt = require('jsonwebtoken');
const Doctor = require('../models/Doctor');
const { asyncHandler } = require('../middleware/errorHandler');

/**
 * Generate JWT Token for Doctor
 * @param {string} id - Doctor ID
 * @param {string} role - Role (always 'doctor')
 * @returns {string} - JWT token
 */
const generateToken = (id, role = 'doctor') => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE || '7d'
    });
};

/**
 * @desc    Login doctor
 * @route   POST /api/doctor/auth/login
 * @access  Public
 */
const doctorLogin = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
        return res.status(400).json({
            success: false,
            message: 'Please provide email and password'
        });
    }

    // Find doctor by email and include password field
    const doctor = await Doctor.findOne({ email: email.toLowerCase() }).select('+password');

    if (!doctor) {
        return res.status(401).json({
            success: false,
            message: 'Invalid credentials. Doctor not found.'
        });
    }

    // Check if doctor has password set
    if (!doctor.password) {
        return res.status(401).json({
            success: false,
            message: 'Account not set up. Please contact administrator.'
        });
    }

    // Check if password matches
    const isMatch = await doctor.matchPassword(password);

    if (!isMatch) {
        return res.status(401).json({
            success: false,
            message: 'Invalid credentials. Password is incorrect.'
        });
    }

    // Generate token
    const token = generateToken(doctor._id, 'doctor');

    // Send response
    res.status(200).json({
        success: true,
        message: 'Login successful',
        token,
        doctor: {
            id: doctor._id,
            name: doctor.name,
            email: doctor.email,
            specialization: doctor.specialization,
            qualifications: doctor.qualifications,
            experience: doctor.experience,
            hospital: doctor.hospital,
            fees: doctor.fees,
            mobile: doctor.mobile || '',
            rating: doctor.rating,
            about: doctor.about,
            role: 'doctor'
        }
    });
});

/**
 * @desc    Get current logged in doctor
 * @route   GET /api/doctor/auth/me
 * @access  Private (Doctor)
 */
const getDoctorProfile = asyncHandler(async (req, res) => {
    const doctor = await Doctor.findById(req.doctor._id);

    if (!doctor) {
        return res.status(404).json({
            success: false,
            message: 'Doctor not found'
        });
    }

    res.status(200).json({
        success: true,
        doctor: {
            id: doctor._id,
            name: doctor.name,
            email: doctor.email,
            specialization: doctor.specialization,
            qualifications: doctor.qualifications,
            experience: doctor.experience,
            hospital: doctor.hospital,
            fees: doctor.fees,
            mobile: doctor.mobile || '',
            rating: doctor.rating,
            about: doctor.about,
            availability: doctor.availability,
            role: 'doctor'
        }
    });
});

/**
 * @desc    Update doctor profile
 * @route   PUT /api/doctor/auth/profile
 * @access  Private (Doctor)
 */
const updateDoctorProfile = asyncHandler(async (req, res) => {
    const { mobile, about, fees } = req.body;

    const doctor = await Doctor.findById(req.doctor._id);

    if (!doctor) {
        return res.status(404).json({
            success: false,
            message: 'Doctor not found'
        });
    }

    // Update allowed fields (hospital is fixed as Medicare)
    if (mobile !== undefined) {
        doctor.mobile = mobile.trim();
    }
    if (about !== undefined) {
        doctor.about = about.trim();
    }
    if (fees !== undefined) {
        doctor.fees = fees;
    }

    await doctor.save();

    res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        doctor: {
            id: doctor._id,
            name: doctor.name,
            email: doctor.email,
            specialization: doctor.specialization,
            qualifications: doctor.qualifications,
            experience: doctor.experience,
            hospital: doctor.hospital,
            fees: doctor.fees,
            mobile: doctor.mobile || '',
            rating: doctor.rating,
            about: doctor.about,
            role: 'doctor'
        }
    });
});

/**
 * @desc    Change doctor password
 * @route   PUT /api/doctor/auth/password
 * @access  Private (Doctor)
 */
const changeDoctorPassword = asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    // Validate input
    if (!currentPassword || !newPassword) {
        return res.status(400).json({
            success: false,
            message: 'Please provide current and new password'
        });
    }

    if (newPassword.length < 6) {
        return res.status(400).json({
            success: false,
            message: 'New password must be at least 6 characters'
        });
    }

    // Get doctor with password
    const doctor = await Doctor.findById(req.doctor._id).select('+password');

    if (!doctor) {
        return res.status(404).json({
            success: false,
            message: 'Doctor not found'
        });
    }

    // Check current password
    const isMatch = await doctor.matchPassword(currentPassword);

    if (!isMatch) {
        return res.status(401).json({
            success: false,
            message: 'Current password is incorrect'
        });
    }

    // Update password (will be hashed by pre-save hook)
    doctor.password = newPassword;
    await doctor.save();

    // Generate new token
    const token = generateToken(doctor._id, 'doctor');

    res.status(200).json({
        success: true,
        message: 'Password changed successfully',
        token
    });
});

module.exports = {
    doctorLogin,
    getDoctorProfile,
    updateDoctorProfile,
    changeDoctorPassword
};
