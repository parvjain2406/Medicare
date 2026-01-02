const mongoose = require('mongoose');

/**
 * Review Schema for MediCare application
 * Stores patient reviews and ratings for doctors
 */
const reviewSchema = new mongoose.Schema({
    doctor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Doctor',
        required: [true, 'Review must belong to a doctor']
    },
    patient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Review must come from a patient']
    },
    appointment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Appointment',
        required: [true, 'Review must be linked to an appointment']
    },
    rating: {
        type: Number,
        min: 1,
        max: 5,
        required: [true, 'Rating is required']
    },
    comment: {
        type: String,
        required: [true, 'Review comment is required'],
        trim: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Prevent duplicate reviews for the same appointment
reviewSchema.index({ appointment: 1 }, { unique: true });

// Static method to calculate avg rating
reviewSchema.statics.calcAverageRatings = async function(doctorId) {
    const stats = await this.aggregate([
        {
            $match: { doctor: doctorId }
        },
        {
            $group: {
                _id: '$doctor',
                nRating: { $sum: 1 },
                avgRating: { $avg: '$rating' }
            }
        }
    ]);

    if (stats.length > 0) {
        await mongoose.model('Doctor').findByIdAndUpdate(doctorId, {
            rating: Math.round(stats[0].avgRating * 10) / 10, // Round to 1 decimal
            numReviews: stats[0].nRating
        });
    } else {
        await mongoose.model('Doctor').findByIdAndUpdate(doctorId, {
            rating: 0,
            numReviews: 0
        });
    }
};

// Call calcAverageRatings after save
reviewSchema.post('save', function() {
    this.constructor.calcAverageRatings(this.doctor);
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
