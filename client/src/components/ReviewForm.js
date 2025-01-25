import React, { useState } from 'react';
import axios from 'axios';
import '../assets/styles/ReviewForm.css';

const ReviewForm = ({ eventId, addNewReview }) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    if (!token) {
      alert('Please log in to leave a review.');
      return;
    }

    try {
      const { name } = JSON.parse(localStorage.getItem('user')) || {}; // Get username from local storage
      const review = {
        rating,
        comment,
        username: name || 'Anonymous',
        date: new Date().toLocaleString(),
      };

      const response = await axios.post(
        `http://localhost:5000/api/reviews/${eventId}`,
        review,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update the reviews list optimistically
      addNewReview(response.data); // Pass the response to parent

      setComment(''); // Clear the input fields
      setRating(5);
      alert('Review submitted successfully!');
    } catch (err) {
      console.error('Error submitting review:', err);
      alert('Error submitting review.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="review-form">
      <h3>Add Your Review</h3>
      <div className="star-rating">
        {[1, 2, 3, 4, 5].map((num) => (
          <span
            key={num}
            className={`star ${rating >= num ? 'filled' : ''}`}
            onClick={() => setRating(num)}
          >
            ★
          </span>
        ))}
      </div>
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Write your review here..."
        required
      ></textarea>
      <button type="submit">Submit Review</button>
    </form>
  );
};

export default ReviewForm;
