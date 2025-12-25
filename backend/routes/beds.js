const express = require('express');
const router = express.Router();
const {
    getBedAvailability,
    getAvailableBeds,
    bookBed,
    getMyBookings,
    cancelBooking
} = require('../controllers/bedController');
const { protect } = require('../middleware/authMiddleware');

/**
 * Bed Routes
 * /api/beds
 */

// Public routes
router.get('/availability', getBedAvailability);
router.get('/available/:wardType', getAvailableBeds);

// Protected routes
router.post('/book', protect, bookBed);
router.get('/my-bookings', protect, getMyBookings);
router.delete('/booking/:id', protect, cancelBooking);

module.exports = router;
