const Doctor = require('../models/Doctor');

/**
 * @desc    Get all doctors with optional filters
 * @route   GET /api/doctors
 * @access  Public
 */
exports.getAllDoctors = async (req, res) => {
    try {
        const { specialization, search, minExperience, maxFees } = req.query;

        let query = { isActive: true };

        // Filter by specialization
        if (specialization && specialization !== 'All') {
            query.specialization = specialization;
        }

        // Search by name or hospital
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { hospital: { $regex: search, $options: 'i' } }
            ];
        }

        // Filter by minimum experience
        if (minExperience) {
            query.experience = { $gte: parseInt(minExperience) };
        }

        // Filter by maximum fees
        if (maxFees) {
            query.fees = { $lte: parseInt(maxFees) };
        }

        const doctors = await Doctor.find(query).sort({ rating: -1, experience: -1 });

        res.status(200).json({
            success: true,
            count: doctors.length,
            data: doctors
        });
    } catch (error) {
        console.error('Get doctors error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching doctors'
        });
    }
};

/**
 * @desc    Get single doctor by ID
 * @route   GET /api/doctors/:id
 * @access  Public
 */
exports.getDoctorById = async (req, res) => {
    try {
        const doctor = await Doctor.findById(req.params.id);

        if (!doctor) {
            return res.status(404).json({
                success: false,
                message: 'Doctor not found'
            });
        }

        res.status(200).json({
            success: true,
            data: doctor
        });
    } catch (error) {
        console.error('Get doctor error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching doctor'
        });
    }
};

/**
 * @desc    Get all unique specializations
 * @route   GET /api/doctors/specializations
 * @access  Public
 */
exports.getSpecializations = async (req, res) => {
    try {
        const specializations = await Doctor.distinct('specialization', { isActive: true });

        res.status(200).json({
            success: true,
            data: specializations.sort()
        });
    } catch (error) {
        console.error('Get specializations error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching specializations'
        });
    }
};
