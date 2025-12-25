const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');

/**
 * @desc    Get all appointments for logged in user
 * @route   GET /api/appointments
 * @access  Private
 */
exports.getAppointments = async (req, res) => {
    try {
        const { status } = req.query;

        let query = { patient: req.user._id };

        if (status && status !== 'All') {
            query.status = status;
        }

        const appointments = await Appointment.find(query)
            .populate('doctor', 'name specialization hospital image fees')
            .sort({ date: -1, createdAt: -1 });

        res.status(200).json({
            success: true,
            count: appointments.length,
            data: appointments
        });
    } catch (error) {
        console.error('Get appointments error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching appointments'
        });
    }
};

/**
 * @desc    Get single appointment by ID
 * @route   GET /api/appointments/:id
 * @access  Private
 */
exports.getAppointmentById = async (req, res) => {
    try {
        const appointment = await Appointment.findOne({
            _id: req.params.id,
            patient: req.user._id
        }).populate('doctor', 'name specialization hospital image fees qualifications');

        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: 'Appointment not found'
            });
        }

        res.status(200).json({
            success: true,
            data: appointment
        });
    } catch (error) {
        console.error('Get appointment error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching appointment'
        });
    }
};

/**
 * @desc    Create new appointment
 * @route   POST /api/appointments
 * @access  Private
 */
exports.createAppointment = async (req, res) => {
    try {
        const { doctorId, date, timeSlot, reason } = req.body;

        // Validate doctor exists
        const doctor = await Doctor.findById(doctorId);
        if (!doctor) {
            return res.status(404).json({
                success: false,
                message: 'Doctor not found'
            });
        }

        // Check if doctor is available on the selected day
        // Add T00:00:00 to ensure local timezone is used
        const appointmentDate = new Date(date + 'T00:00:00');
        // Use 'short' weekday to match seed data format (Mon, Tue, Wed, etc.)
        const dayOfWeek = appointmentDate.toLocaleDateString('en-US', { weekday: 'short' });

        console.log('Booking attempt - Date:', date, 'Day:', dayOfWeek, 'Doctor days:', doctor.availability.days);

        if (!doctor.availability.days.includes(dayOfWeek)) {
            return res.status(400).json({
                success: false,
                message: `Dr. ${doctor.name} is not available on ${dayOfWeek}. Available days: ${doctor.availability.days.join(', ')}`
            });
        }

        // Check if slot is already booked
        const existingAppointment = await Appointment.findOne({
            doctor: doctorId,
            date: new Date(date),
            timeSlot: timeSlot,
            status: { $in: ['Pending', 'Confirmed'] }
        });

        if (existingAppointment) {
            return res.status(400).json({
                success: false,
                message: 'This time slot is already booked. Please select another slot.'
            });
        }

        const appointment = await Appointment.create({
            patient: req.user._id,
            doctor: doctorId,
            date: new Date(date),
            timeSlot,
            reason,
            status: 'Pending'
        });

        // Populate doctor info before sending response
        await appointment.populate('doctor', 'name specialization hospital fees');

        res.status(201).json({
            success: true,
            message: 'Appointment booked successfully',
            data: appointment
        });
    } catch (error) {
        console.error('Create appointment error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while booking appointment'
        });
    }
};

/**
 * @desc    Update appointment status
 * @route   PUT /api/appointments/:id
 * @access  Private
 */
exports.updateAppointment = async (req, res) => {
    try {
        const { status, notes } = req.body;

        const appointment = await Appointment.findOne({
            _id: req.params.id,
            patient: req.user._id
        });

        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: 'Appointment not found'
            });
        }

        if (status) appointment.status = status;
        if (notes) appointment.notes = notes;

        await appointment.save();
        await appointment.populate('doctor', 'name specialization hospital');

        res.status(200).json({
            success: true,
            message: 'Appointment updated successfully',
            data: appointment
        });
    } catch (error) {
        console.error('Update appointment error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while updating appointment'
        });
    }
};

/**
 * @desc    Cancel appointment
 * @route   DELETE /api/appointments/:id
 * @access  Private
 */
exports.cancelAppointment = async (req, res) => {
    try {
        const appointment = await Appointment.findOne({
            _id: req.params.id,
            patient: req.user._id
        });

        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: 'Appointment not found'
            });
        }

        if (appointment.status === 'Completed') {
            return res.status(400).json({
                success: false,
                message: 'Cannot cancel a completed appointment'
            });
        }

        appointment.status = 'Cancelled';
        await appointment.save();

        res.status(200).json({
            success: true,
            message: 'Appointment cancelled successfully'
        });
    } catch (error) {
        console.error('Cancel appointment error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while cancelling appointment'
        });
    }
};

/**
 * @desc    Get available time slots for a doctor on a date
 * @route   GET /api/appointments/slots/:doctorId/:date
 * @access  Public
 */
exports.getAvailableSlots = async (req, res) => {
    try {
        const { doctorId, date } = req.params;

        const doctor = await Doctor.findById(doctorId);
        if (!doctor) {
            return res.status(404).json({
                success: false,
                message: 'Doctor not found'
            });
        }

        // Get all booked slots for the date
        const bookedAppointments = await Appointment.find({
            doctor: doctorId,
            date: new Date(date),
            status: { $ne: 'Cancelled' }
        }).select('timeSlot');

        const bookedSlots = bookedAppointments.map(a => a.timeSlot);

        // Filter out booked slots from available slots
        const availableSlots = doctor.availability.slots.filter(
            slot => !bookedSlots.includes(slot)
        );

        res.status(200).json({
            success: true,
            data: {
                allSlots: doctor.availability.slots,
                bookedSlots,
                availableSlots
            }
        });
    } catch (error) {
        console.error('Get slots error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching slots'
        });
    }
};
