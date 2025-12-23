const MedicalRecord = require('../models/MedicalRecord');

/**
 * @desc    Get all medical records for logged in user
 * @route   GET /api/records
 * @access  Private
 */
exports.getRecords = async (req, res) => {
    try {
        const { status, visitType } = req.query;

        let query = { patient: req.user._id };

        if (status && status !== 'All') {
            query.status = status;
        }

        if (visitType && visitType !== 'All') {
            query.visitType = visitType;
        }

        const records = await MedicalRecord.find(query)
            .populate('doctor', 'name specialization hospital')
            .sort({ date: -1 });

        res.status(200).json({
            success: true,
            count: records.length,
            data: records
        });
    } catch (error) {
        console.error('Get records error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching records'
        });
    }
};

/**
 * @desc    Get single medical record by ID
 * @route   GET /api/records/:id
 * @access  Private
 */
exports.getRecordById = async (req, res) => {
    try {
        const record = await MedicalRecord.findOne({
            _id: req.params.id,
            patient: req.user._id
        }).populate('doctor', 'name specialization hospital qualifications');

        if (!record) {
            return res.status(404).json({
                success: false,
                message: 'Record not found'
            });
        }

        res.status(200).json({
            success: true,
            data: record
        });
    } catch (error) {
        console.error('Get record error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching record'
        });
    }
};

/**
 * @desc    Get visit type statistics
 * @route   GET /api/records/stats
 * @access  Private
 */
exports.getRecordStats = async (req, res) => {
    try {
        const stats = await MedicalRecord.aggregate([
            { $match: { patient: req.user._id } },
            {
                $group: {
                    _id: '$visitType',
                    count: { $sum: 1 }
                }
            }
        ]);

        const totalRecords = await MedicalRecord.countDocuments({ patient: req.user._id });
        const completedRecords = await MedicalRecord.countDocuments({
            patient: req.user._id,
            status: 'Completed'
        });

        res.status(200).json({
            success: true,
            data: {
                byVisitType: stats,
                total: totalRecords,
                completed: completedRecords
            }
        });
    } catch (error) {
        console.error('Get record stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching statistics'
        });
    }
};
