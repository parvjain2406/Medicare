const express = require('express');
const router = express.Router();
// Let me double check usage in other files.
// Usually: const express = require('express'); const router = express.Router();
// I will stick to standard express.Router() but let me check server.js imports first to be safe if I can view it.
// Wait, I can't view it easily without another tool call. I'll trust standard express logic.
// actually, I can just use `const router = express.Router();`

const { createReview, getDoctorReviews } = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
    .post(protect, createReview);

router.route('/:doctorId')
    .get(getDoctorReviews);

module.exports = router;
