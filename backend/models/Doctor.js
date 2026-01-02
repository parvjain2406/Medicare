const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

/**
 * Doctor Schema for MediCare application
 * Stores doctor profiles with Indian context data and authentication
 */
const doctorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Doctor name is required'],
        trim: true
    },
    email: {
        type: String,
        unique: true,
        lowercase: true,
        sparse: true,
        trim: true,
        match: [
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            'Please provide a valid email'
        ]
    },
    password: {
        type: String,
        minlength: [6, 'Password must be at least 6 characters'],
        select: false // Don't return password by default
    },
    specialization: {
        type: String,
        required: [true, 'Specialization is required'],
        trim: true
    },
    qualifications: {
        type: String,
        required: [true, 'Qualifications are required'],
        trim: true
    },
    experience: {
        type: Number,
        required: [true, 'Experience is required'],
        min: 0
    },
    hospital: {
        type: String,
        required: [true, 'Hospital name is required'],
        trim: true
    },
    fees: {
        type: Number,
        required: [true, 'Consultation fees are required'],
        min: 0
    },
    availability: {
        days: [{
            type: String,
            enum: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
        }],
        slots: [{
            type: String
        }]
    },
    image: {
        type: String,
        default: ''
    },
    rating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5,
        set: val => Math.round(val * 10) / 10
    },
    numReviews: {
        type: Number,
        default: 0
    },
    about: {
        type: String,
        default: ''
    },
    mobile: {
        type: String,
        trim: true,
        default: ''
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

/**
 * Pre-save middleware to hash password
 * Only hashes if password was modified
 */
doctorSchema.pre('save', async function (next) {
    // Only hash password if it's new or modified
    if (!this.isModified('password')) {
        return next();
    }

    try {
        // Generate salt with 12 rounds
        const salt = await bcrypt.genSalt(12);
        // Hash the password
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

/**
 * Method to compare entered password with stored hash
 * @param {string} enteredPassword - Plain text password to compare
 * @returns {Promise<boolean>} - True if passwords match
 */
doctorSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Index for searching
doctorSchema.index({ name: 'text', specialization: 'text', hospital: 'text' });

const Doctor = mongoose.model('Doctor', doctorSchema);

module.exports = Doctor;
