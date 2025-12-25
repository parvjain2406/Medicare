const Appointment = require('../models/Appointment');
const { asyncHandler } = require('../middleware/errorHandler');

/**
 * @desc    Get all appointments for the logged-in doctor
 * @route   GET /api/doctor/appointments
 * @access  Private (Doctor)
 */
const getDoctorAppointments = asyncHandler(async (req, res) => {
    const { status, date, sortBy = 'date' } = req.query;

    let query = { doctor: req.doctor._id };

    // Filter by status
    if (status && status !== 'All') {
        query.status = status;
    }

    // Filter by date
    if (date) {
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);
        query.date = { $gte: startOfDay, $lte: endOfDay };
    }

    // Sort options
    let sortOption = {};
    switch (sortBy) {
        case 'date':
            sortOption = { date: 1, timeSlot: 1 };
            break;
        case 'status':
            sortOption = { status: 1, date: 1 };
            break;
        case 'newest':
            sortOption = { createdAt: -1 };
            break;
        default:
            sortOption = { date: 1 };
    }

    const appointments = await Appointment.find(query)
        .populate('patient', 'name email mobile')
        .sort(sortOption);

    // Group appointments by status for dashboard
    const pending = appointments.filter(a => a.status === 'Pending');
    const confirmed = appointments.filter(a => a.status === 'Confirmed');
    const completed = appointments.filter(a => a.status === 'Completed');
    const rejected = appointments.filter(a => a.status === 'Rejected');
    const cancelled = appointments.filter(a => a.status === 'Cancelled');

    res.status(200).json({
        success: true,
        count: appointments.length,
        data: appointments,
        summary: {
            pending: pending.length,
            confirmed: confirmed.length,
            completed: completed.length,
            rejected: rejected.length,
            cancelled: cancelled.length,
            total: appointments.length
        }
    });
});

/**
 * @desc    Get single appointment details
 * @route   GET /api/doctor/appointments/:id
 * @access  Private (Doctor)
 */
const getAppointmentById = asyncHandler(async (req, res) => {
    const appointment = await Appointment.findOne({
        _id: req.params.id,
        doctor: req.doctor._id
    }).populate('patient', 'name email mobile dob');

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
});

/**
 * @desc    Update appointment status (Accept/Reject)
 * @route   PUT /api/doctor/appointments/:id/status
 * @access  Private (Doctor)
 */
const updateAppointmentStatus = asyncHandler(async (req, res) => {
    const { status, rejectionReason } = req.body;

    // Validate status
    if (!status || !['Confirmed', 'Rejected'].includes(status)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid status. Use "Confirmed" or "Rejected"'
        });
    }

    // If rejecting, require reason
    if (status === 'Rejected' && !rejectionReason) {
        return res.status(400).json({
            success: false,
            message: 'Please provide a reason for rejection'
        });
    }

    const appointment = await Appointment.findOne({
        _id: req.params.id,
        doctor: req.doctor._id
    });

    if (!appointment) {
        return res.status(404).json({
            success: false,
            message: 'Appointment not found'
        });
    }

    // Only pending appointments can be accepted/rejected
    if (appointment.status !== 'Pending') {
        return res.status(400).json({
            success: false,
            message: `Cannot update status. Appointment is already ${appointment.status}`
        });
    }

    appointment.status = status;
    if (status === 'Rejected') {
        appointment.rejectionReason = rejectionReason;
    }

    await appointment.save();

    // Populate patient info for response
    await appointment.populate('patient', 'name email mobile');

    res.status(200).json({
        success: true,
        message: `Appointment ${status.toLowerCase()} successfully`,
        data: appointment
    });
});

/**
 * @desc    Complete appointment with prescription
 * @route   PUT /api/doctor/appointments/:id/complete
 * @access  Private (Doctor)
 */
const completeAppointment = asyncHandler(async (req, res) => {
    const { prescription } = req.body;

    // Validate prescription
    if (!prescription) {
        return res.status(400).json({
            success: false,
            message: 'Please provide prescription details'
        });
    }

    const appointment = await Appointment.findOne({
        _id: req.params.id,
        doctor: req.doctor._id
    });

    if (!appointment) {
        return res.status(404).json({
            success: false,
            message: 'Appointment not found'
        });
    }

    // Only confirmed appointments can be completed
    if (appointment.status !== 'Confirmed') {
        return res.status(400).json({
            success: false,
            message: `Cannot complete appointment. Current status is ${appointment.status}`
        });
    }

    // Update appointment
    appointment.status = 'Completed';
    appointment.prescription = {
        medications: prescription.medications || [],
        diagnosis: prescription.diagnosis || '',
        notes: prescription.notes || '',
        issuedAt: new Date()
    };

    await appointment.save();

    // Populate patient info for response
    await appointment.populate('patient', 'name email mobile');

    res.status(200).json({
        success: true,
        message: 'Appointment completed and prescription added successfully',
        data: appointment
    });
});

/**
 * @desc    Get today's schedule for doctor
 * @route   GET /api/doctor/appointments/today
 * @access  Private (Doctor)
 */
const getTodaySchedule = asyncHandler(async (req, res) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const appointments = await Appointment.find({
        doctor: req.doctor._id,
        date: { $gte: today, $lt: tomorrow },
        status: { $in: ['Confirmed', 'Pending'] }
    })
        .populate('patient', 'name email mobile')
        .sort({ timeSlot: 1 });

    res.status(200).json({
        success: true,
        count: appointments.length,
        data: appointments
    });
});

/**
 * @desc    Get appointment statistics for doctor dashboard
 * @route   GET /api/doctor/appointments/stats
 * @access  Private (Doctor)
 */
const getAppointmentStats = asyncHandler(async (req, res) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Use find instead of aggregate for simpler query and proper ObjectId handling
    const appointments = await Appointment.find({ doctor: req.doctor._id });

    // Format stats manually
    const formattedStats = {
        pending: 0,
        confirmed: 0,
        completed: 0,
        rejected: 0,
        cancelled: 0,
        total: appointments.length
    };

    appointments.forEach(apt => {
        const status = apt.status.toLowerCase();
        if (formattedStats.hasOwnProperty(status)) {
            formattedStats[status]++;
        }
    });

    // Get today's appointments count
    const todayCount = await Appointment.countDocuments({
        doctor: req.doctor._id,
        date: { $gte: today, $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000) },
        status: { $in: ['Confirmed', 'Pending'] }
    });

    formattedStats.today = todayCount;

    res.status(200).json({
        success: true,
        data: formattedStats
    });
});

module.exports = {
    getDoctorAppointments,
    getAppointmentById,
    updateAppointmentStatus,
    completeAppointment,
    getTodaySchedule,
    getAppointmentStats
};
