const Review = require('../models/Review');
const User = require('../models/User');
const Event = require('../models/Event');

// Get reviews for an event
exports.getReviewsByEvent = async (req, res) => {
  const { eventId } = req.params;
  try {
    const reviews = await Review.find({ eventId }).populate('userId', 'name');
    res.status(200).json(reviews);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Add a review
exports.addReview = async (req, res) => {
  const { eventId } = req.params;
  const { rating, comment } = req.body;
  const userId = req.user?.id; 
  const username = req.user.name  || 'Anonymous'; 

  if (!userId) {
    return res.status(400).json({ message: 'User is not authenticated' });
  }

  try {
    console.log(`Review Submission for event ${eventId} by user ${userId}`);
    const event = await Event.findById(eventId);

    if (!event) {
      console.log('Event not found');
      return res.status(404).json({ message: 'Event not found' });
    }
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    // Check if the user has already submitted a review for this event if we want to make him submit only one review
    // const existingReview = await Review.findOne({ eventId, userId });

    // if (existingReview) {
    //   return res.status(400).json({ message: 'You have already reviewed this event' });
    // }

    // Create and save the new review
    const newReview = new Review({
      eventId,
      userId,
      username,
      rating,
      comment,
    });

    await newReview.save();
    event.reviews.push(newReview._id);
    await event.save();

    res.status(200).json({ message: 'Review submitted successfully', review: newReview });
  } catch (err) {
    console.error('Review Error:', err);
    res.status(500).json({ message: 'Server error during review submission', error: err.message });
  }
};


// Delete a review (only for admin)
exports.deleteReview = async (req, res) => {
  const { userId, eventId, comment } = req.body; 

  try {
    const deletedReview = await Review.findOneAndDelete({ userId, eventId, comment });

    if (!deletedReview) {
      return res.status(404).json({ message: 'Review not found.' });
    }

    res.status(200).json({ message: 'Review deleted successfully.', deletedReview });
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({ message: 'Server error while deleting the review.' });
  }
};


