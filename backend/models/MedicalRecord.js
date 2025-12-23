const mongoose = require('mongoose');

/**
 * Medical Record Schema for MediCare application
 * Stores patient visit history and medical records
 */
const medicalRecordSchema = new mongoose.Schema({
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
    appointment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Appointment'
    },
    visitType: {
        type: String,
        enum: ['Consultation', 'Follow-up', 'Lab Test', 'Surgery', 'Emergency', 'Routine Checkup'],
        default: 'Consultation'
    },
    diagnosis: {
        type: String,
        required: [true, 'Diagnosis is required'],
        trim: true
    },
    symptoms: [{
        type: String,
        trim: true
    }],
    notes: {
        type: String,
        default: ''
    },
    vitals: {
        bloodPressure: String,
        temperature: String,
        pulse: String,
        weight: String
    },
    date: {
        type: Date,
        required: [true, 'Date is required']
    },
    status: {
        type: String,
        enum: ['Completed', 'Cancelled', 'Pending'],
        default: 'Completed'
    },
    attachments: [{
        name: String,
        url: String,
        type: String
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Index for efficient queries
medicalRecordSchema.index({ patient: 1, date: -1 });
medicalRecordSchema.index({ status: 1 });

const MedicalRecord = mongoose.model('MedicalRecord', medicalRecordSchema);

module.exports = MedicalRecord;
