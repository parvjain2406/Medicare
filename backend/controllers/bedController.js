const { Bed, BedBooking } = require('../models/Bed');

/**
 * Get bed availability summary
 * @route GET /api/beds/availability
 * @access Public
 */
const getBedAvailability = async (req, res) => {
    try {
        // Get counts by ward type and status
        const availability = await Bed.aggregate([
            {
                $group: {
                    _id: '$wardType',
                    total: { $sum: 1 },
                    available: {
                        $sum: { $cond: [{ $eq: ['$status', 'Available'] }, 1, 0] }
                    },
                    occupied: {
                        $sum: { $cond: [{ $eq: ['$status', 'Occupied'] }, 1, 0] }
                    },
                    reserved: {
                        $sum: { $cond: [{ $eq: ['$status', 'Reserved'] }, 1, 0] }
                    },
                    maintenance: {
                        $sum: { $cond: [{ $eq: ['$status', 'Maintenance'] }, 1, 0] }
                    }
                }
            },
            {
                $project: {
                    wardType: '$_id',
                    total: 1,
                    available: 1,
                    occupied: 1,
                    reserved: 1,
                    maintenance: 1,
                    // Combined: occupied + reserved = beds not available
                    booked: { $add: ['$occupied', '$reserved'] },
                    // Occupancy rate should include both occupied AND reserved beds
                    occupancyRate: {
                        $multiply: [
                            {
                                $divide: [
                                    { $add: ['$occupied', '$reserved'] },
                                    { $max: ['$total', 1] }
                                ]
                            },
                            100
                        ]
                    }
                }
            },
            { $sort: { wardType: 1 } }
        ]);

        // Get price info for each ward type
        const priceInfo = await Bed.aggregate([
            {
                $group: {
                    _id: '$wardType',
                    minPrice: { $min: '$pricePerDay' },
                    maxPrice: { $max: '$pricePerDay' },
                    avgPrice: { $avg: '$pricePerDay' }
                }
            }
        ]);

        // Merge price info with availability
        const result = availability.map(ward => {
            const price = priceInfo.find(p => p._id === ward.wardType) || {};
            return {
                ...ward,
                pricePerDay: {
                    min: price.minPrice || 0,
                    max: price.maxPrice || 0,
                    avg: Math.round(price.avgPrice || 0)
                }
            };
        });

        res.status(200).json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error('Get bed availability error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

/**
 * Get available beds by ward type
 * @route GET /api/beds/available/:wardType
 * @access Public
 */
const getAvailableBeds = async (req, res) => {
    try {
        const { wardType } = req.params;

        const beds = await Bed.find({
            wardType: wardType,
            status: 'Available'
        }).select('bedNumber floor pricePerDay features').sort({ floor: 1, bedNumber: 1 });

        res.status(200).json({
            success: true,
            count: beds.length,
            data: beds
        });
    } catch (error) {
        console.error('Get available beds error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

/**
 * Book a bed
 * @route POST /api/beds/book
 * @access Private
 */
const bookBed = async (req, res) => {
    try {
        const {
            bedId,
            admissionDate,
            expectedDischarge,
            reason,
            emergencyContact
        } = req.body;

        // Validate required fields
        if (!bedId || !admissionDate || !expectedDischarge || !reason) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields'
            });
        }

        // Check if bed exists and is available
        const bed = await Bed.findById(bedId);
        if (!bed) {
            return res.status(404).json({
                success: false,
                message: 'Bed not found'
            });
        }

        if (bed.status !== 'Available') {
            return res.status(400).json({
                success: false,
                message: 'This bed is no longer available'
            });
        }

        // Check if patient already has an active booking
        const existingBooking = await BedBooking.findOne({
            patient: req.user._id,
            status: { $in: ['Confirmed', 'Admitted'] }
        });

        if (existingBooking) {
            return res.status(400).json({
                success: false,
                message: 'You already have an active bed booking'
            });
        }

        // Calculate estimated cost
        const days = Math.ceil(
            (new Date(expectedDischarge) - new Date(admissionDate)) / (1000 * 60 * 60 * 24)
        );
        const totalAmount = days * bed.pricePerDay;

        // Create booking
        const booking = await BedBooking.create({
            bed: bedId,
            patient: req.user._id,
            wardType: bed.wardType,
            bedNumber: bed.bedNumber,
            admissionDate,
            expectedDischarge,
            reason,
            emergencyContact,
            totalAmount,
            status: 'Confirmed'
        });

        // Update bed status
        bed.status = 'Reserved';
        bed.booking = {
            patient: req.user._id,
            admissionDate,
            expectedDischarge,
            reason,
            emergencyContact: emergencyContact?.phone,
            bookedAt: new Date()
        };
        await bed.save();

        // Populate booking for response
        const populatedBooking = await BedBooking.findById(booking._id)
            .populate('bed', 'bedNumber wardType floor pricePerDay')
            .populate('patient', 'name email mobile');

        res.status(201).json({
            success: true,
            message: 'Bed booked successfully',
            data: populatedBooking
        });
    } catch (error) {
        console.error('Book bed error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

/**
 * Get user's bed bookings
 * @route GET /api/beds/my-bookings
 * @access Private
 */
const getMyBookings = async (req, res) => {
    try {
        const bookings = await BedBooking.find({ patient: req.user._id })
            .populate('bed', 'bedNumber wardType floor pricePerDay features')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: bookings.length,
            data: bookings
        });
    } catch (error) {
        console.error('Get my bookings error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

/**
 * Cancel bed booking
 * @route DELETE /api/beds/booking/:id
 * @access Private
 */
const cancelBooking = async (req, res) => {
    try {
        const booking = await BedBooking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        // Check ownership
        if (booking.patient.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to cancel this booking'
            });
        }

        // Can only cancel if not yet admitted
        if (booking.status === 'Admitted') {
            return res.status(400).json({
                success: false,
                message: 'Cannot cancel after admission'
            });
        }

        // Update booking status
        booking.status = 'Cancelled';
        await booking.save();

        // Free up the bed
        await Bed.findByIdAndUpdate(booking.bed, {
            status: 'Available',
            booking: null,
            currentPatient: null
        });

        res.status(200).json({
            success: true,
            message: 'Booking cancelled successfully'
        });
    } catch (error) {
        console.error('Cancel booking error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

module.exports = {
    getBedAvailability,
    getAvailableBeds,
    bookBed,
    getMyBookings,
    cancelBooking
};
