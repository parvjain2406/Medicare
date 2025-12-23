const mongoose = require('mongoose');

/**
 * Doctor Schema for MediCare application
 * Stores doctor profiles with Indian context data
 */
const doctorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Doctor name is required'],
        trim: true
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
        default: 4.5,
        min: 0,
        max: 5
    },
    about: {
        type: String,
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

// Index for searching
doctorSchema.index({ name: 'text', specialization: 'text', hospital: 'text' });

const Doctor = mongoose.model('Doctor', doctorSchema);

module.exports = Doctor;
