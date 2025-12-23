const Prescription = require('../models/Prescription');

/**
 * @desc    Get all prescriptions for logged in user
 * @route   GET /api/prescriptions
 * @access  Private
 */
exports.getPrescriptions = async (req, res) => {
    try {
        const { isActive } = req.query;

        let query = { patient: req.user._id };

        if (isActive === 'true') {
            query.isActive = true;
        } else if (isActive === 'false') {
            query.isActive = false;
        }

        const prescriptions = await Prescription.find(query)
            .populate('doctor', 'name specialization hospital')
            .sort({ date: -1 });

        res.status(200).json({
            success: true,
            count: prescriptions.length,
            data: prescriptions
        });
    } catch (error) {
        console.error('Get prescriptions error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching prescriptions'
        });
    }
};

/**
 * @desc    Get single prescription by ID
 * @route   GET /api/prescriptions/:id
 * @access  Private
 */
exports.getPrescriptionById = async (req, res) => {
    try {
        const prescription = await Prescription.findOne({
            _id: req.params.id,
            patient: req.user._id
        })
            .populate('doctor', 'name specialization hospital qualifications')
            .populate('record', 'diagnosis visitType date');

        if (!prescription) {
            return res.status(404).json({
                success: false,
                message: 'Prescription not found'
            });
        }

        res.status(200).json({
            success: true,
            data: prescription
        });
    } catch (error) {
        console.error('Get prescription error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching prescription'
        });
    }
};

/**
 * @desc    Get active prescriptions count
 * @route   GET /api/prescriptions/active-count
 * @access  Private
 */
exports.getActivePrescriptionsCount = async (req, res) => {
    try {
        const count = await Prescription.countDocuments({
            patient: req.user._id,
            isActive: true
        });

        res.status(200).json({
            success: true,
            data: { activeCount: count }
        });
    } catch (error) {
        console.error('Get active count error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching count'
        });
    }
};
