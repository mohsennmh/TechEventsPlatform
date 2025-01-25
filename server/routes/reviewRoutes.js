const express = require('express');
const {adminAuth} = require('../middleware/authMiddleware');
const router = express.Router();

const {
  getReviewsByEvent,
  addReview,
  deleteReview,
} = require('../controllers/reviewController');
const { verifyToken } = require('../middleware/authMiddleware');



// Get all reviews for an event
router.get('/reviews/:eventId', getReviewsByEvent);

// Add a review to an event
router.post('/reviews/:eventId', verifyToken, addReview);

// Delete a review (only for admins)
router.delete('/reviews/delete-review', verifyToken, adminAuth,deleteReview);

module.exports = router;
