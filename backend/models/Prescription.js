const mongoose = require('mongoose');

/**
 * Prescription Schema for MediCare application
 * Stores prescriptions with Indian medicine names
 */
const prescriptionSchema = new mongoose.Schema({
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
    record: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MedicalRecord'
    },
    medicines: [{
        name: {
            type: String,
            required: [true, 'Medicine name is required'],
            trim: true
        },
        genericName: {
            type: String,
            trim: true
        },
        dosage: {
            type: String,
            required: [true, 'Dosage is required'],
            trim: true
        },
        duration: {
            type: String,
            required: [true, 'Duration is required'],
            trim: true
        },
        instructions: {
            type: String,
            default: ''
        }
    }],
    diagnosis: {
        type: String,
        trim: true
    },
    notes: {
        type: String,
        default: ''
    },
    date: {
        type: Date,
        default: Date.now
    },
    validUntil: {
        type: Date
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

// Index for efficient queries
prescriptionSchema.index({ patient: 1, date: -1 });
prescriptionSchema.index({ isActive: 1 });

const Prescription = mongoose.model('Prescription', prescriptionSchema);

module.exports = Prescription;
