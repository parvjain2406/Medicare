const mongoose = require('mongoose');

/**
 * Appointment Schema for MediCare application
 * Handles appointment bookings between patients and doctors
 */
const appointmentSchema = new mongoose.Schema({
    patient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Patient is required']
    },
    doctor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Doctor',
        required: [true, 'Doctor is required']
    },
    date: {
        type: Date,
        required: [true, 'Appointment date is required']
    },
    timeSlot: {
        type: String,
        required: [true, 'Time slot is required']
    },
    reason: {
        type: String,
        required: [true, 'Reason for visit is required'],
        trim: true,
        maxlength: [500, 'Reason cannot exceed 500 characters']
    },
    status: {
        type: String,
        enum: ['Pending', 'Confirmed', 'Rejected', 'Completed', 'Cancelled'],
        default: 'Pending'
    },
    prescription: {
        medications: [{
            name: {
                type: String,
                trim: true
            },
            dosage: {
                type: String,
                trim: true
            },
            duration: {
                type: String,
                trim: true
            },
            instructions: {
                type: String,
                trim: true
            }
        }],
        diagnosis: {
            type: String,
            trim: true
        },
        notes: {
            type: String,
            trim: true
        },
        issuedAt: {
            type: Date
        }
    },
    notes: {
        type: String,
        default: ''
    },
    rejectionReason: {
        type: String,
        default: ''
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update timestamp on save
appointmentSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

// Index for efficient queries
appointmentSchema.index({ patient: 1, date: -1 });
appointmentSchema.index({ doctor: 1, date: 1 });
appointmentSchema.index({ status: 1 });

const Appointment = mongoose.model('Appointment', appointmentSchema);

module.exports = Appointment;
