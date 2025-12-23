const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

/**
 * User Schema for MediCare application
 * Handles patient, doctor, and admin users
 */
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide a name'],
        trim: true,
        maxlength: [50, 'Name cannot exceed 50 characters']
    },
    email: {
        type: String,
        required: [true, 'Please provide an email'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            'Please provide a valid email'
        ]
    },
    mobile: {
        type: String,
        trim: true,
        default: '',
        // Allow empty strings, only validate if provided
        validate: {
            validator: function (v) {
                if (!v || v === '') return true;
                return /^[0-9]{10,15}$/.test(v);
            },
            message: 'Please provide a valid mobile number (10-15 digits)'
        }
    },
    dob: {
        type: Date,
        default: null
    },
    password: {
        type: String,
        required: [true, 'Please provide a password'],
        minlength: [6, 'Password must be at least 6 characters'],
        select: false // Don't return password by default
    },
    role: {
        type: String,
        enum: ['patient', 'doctor', 'admin'],
        default: 'patient'
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
userSchema.pre('save', async function (next) {
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
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Create sparse index for mobile to allow multiple empty values
userSchema.index({ mobile: 1 }, {
    sparse: true,
    partialFilterExpression: { mobile: { $ne: '' } }
});

const User = mongoose.model('User', userSchema);

module.exports = User;
