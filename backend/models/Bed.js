const mongoose = require('mongoose');

/**
 * Bed Schema
 * Tracks individual beds in wards
 */
const bedSchema = new mongoose.Schema({
    bedNumber: {
        type: String,
        required: [true, 'Bed number is required'],
        trim: true
    },
    wardType: {
        type: String,
        required: [true, 'Ward type is required'],
        enum: ['General', 'ICU', 'Emergency', 'Pediatric', 'Maternity'],
        default: 'General'
    },
    status: {
        type: String,
        enum: ['Available', 'Occupied', 'Reserved', 'Maintenance'],
        default: 'Available'
    },
    floor: {
        type: Number,
        required: true,
        default: 1
    },
    pricePerDay: {
        type: Number,
        required: true,
        default: 1500
    },
    features: [{
        type: String
    }],
    // Current patient if occupied
    currentPatient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    // Booking details
    booking: {
        patient: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        admissionDate: Date,
        expectedDischarge: Date,
        reason: String,
        emergencyContact: String,
        bookedAt: Date
    }
}, {
    timestamps: true
});

// Indexes for faster queries
bedSchema.index({ wardType: 1, status: 1 });
bedSchema.index({ bedNumber: 1, wardType: 1 }, { unique: true });

/**
 * Bed Booking Schema
 * Tracks bed booking history
 */
const bedBookingSchema = new mongoose.Schema({
    bed: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Bed',
        required: true
    },
    patient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    wardType: {
        type: String,
        required: true
    },
    bedNumber: {
        type: String,
        required: true
    },
    admissionDate: {
        type: Date,
        required: true
    },
    expectedDischarge: {
        type: Date,
        required: true
    },
    actualDischarge: {
        type: Date
    },
    reason: {
        type: String,
        required: true,
        maxLength: 500
    },
    emergencyContact: {
        name: String,
        phone: String,
        relation: String
    },
    status: {
        type: String,
        enum: ['Confirmed', 'Admitted', 'Discharged', 'Cancelled'],
        default: 'Confirmed'
    },
    totalAmount: {
        type: Number
    },
    notes: {
        type: String
    }
}, {
    timestamps: true
});

const Bed = mongoose.model('Bed', bedSchema);
const BedBooking = mongoose.model('BedBooking', bedBookingSchema);

module.exports = { Bed, BedBooking };
