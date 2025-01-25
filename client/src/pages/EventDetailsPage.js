import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import ReviewForm from '../components/ReviewForm';
import '../assets/styles/eventDetails.css';
import Chat from '../components/chat';

const EventDetailsPage = () => {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [isRSVPed, setIsRSVPed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState('');
  const [user, setUser] = useState(null); // User info state
  const [isAdmin, setIsAdmin] = useState(false); // Admin check state
  const [loadingReviews, setLoadingReviews] = useState(true); // For loading reviews state

  useEffect(() => {
    const fetchUserInfo = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const userResponse = await axios.get('http://localhost:5000/api/auth/me', {
            headers: { Authorization: `Bearer ${token}` },
          });
          setUser(userResponse.data.user);
          setIsAdmin(userResponse.data?.user?.role === 'admin');
          console.log('id: ',userResponse.data.user.id);
          return userResponse.data.user.id; // Get user ID

        } catch (err) {
          console.error('Error fetching user info:', err);
          setError(`Error loading event details: ${err.response?.data?.message || err.message}`);
          setLoading(false);
        }
      }
      return null;
    };

    const fetchEventDetails = async () => {
      try {
        // Fetch event details
        const eventResponse = await axios.get(`http://localhost:5000/api/events/${id}`);
        console.log('Event Response:', eventResponse.data);
        setEvent(eventResponse.data);
      
        // Fetch reviews
        const reviewsResponse = await axios.get(`http://localhost:5000/api/reviews/${id}`);
        setReviews(reviewsResponse.data);
    
        // Fetch user info
        const userId = await fetchUserInfo();
        console.log('Fetched User ID:', userId);
    
        if (userId) {
          // Check if the user is already RSVP'd by matching the userId with the _id of attendees
          const isAttending = eventResponse.data.attendees.some(attendee => attendee._id.toString() === userId.toString());
          console.log('Attendees:', eventResponse.data.attendees);
          console.log('User is Attending:', isAttending);
          setIsRSVPed(isAttending); // Update RSVP state
        }
      } catch (err) {
        console.error('Error loading event details:', err);
        setError('Error loading event details.');
      } finally {
        setLoading(false);
        setLoadingReviews(false); // Stop loading reviews
      }
    };
    fetchEventDetails();
  }, [id]);

  const handleRSVP = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please log in to RSVP.');
      return;
    }

    try {
      await axios.post(
        `http://localhost:5000/api/events/${id}/rsvp`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setIsRSVPed(true);
      setNotification('You have successfully RSVP\'d and purchased a ticket!');
    } catch (error) {
      alert('Error RSVP\'ing');
      console.error(error);
    }
  };

  const addNewReview = async () => {
    setLoadingReviews(true); // Indicate loading state while fetching
    try {
      const response = await axios.get(`http://localhost:5000/api/reviews/${id}`);
      setReviews(response.data); // Update the state with the full reviews list
    } catch (error) {
      console.error('Error fetching updated reviews:', error);
    } finally {
      setLoadingReviews(false); // Stop loading state
    }
  };
  
  

  const handleDeleteReview = async (userId, eventId, comment) => {
    // Ask for confirmation before deleting
    const confirmDelete = window.confirm('Are you sure you want to delete this review?');
    if (!confirmDelete) return;
  
    try {
      // Get the token for authentication
      const token = localStorage.getItem('token');
  
      // Send DELETE request to the server
      const response = await axios.delete('http://localhost:5000/api/reviews/delete-review', {
        headers: { Authorization: `Bearer ${token}` },
        data: { userId, eventId, comment }, // Send required data in the request body
      });
  
      if (response.status === 200) {
        // Notify the user of success
        alert(response.data.message || 'Review deleted successfully!');
  
        // Update the state to remove the deleted review
        setReviews((prevReviews) => prevReviews.filter(
          (review) => review.comment !== comment || review.userId !== userId || review.eventId !== eventId
        ));
        
      }
    } catch (error) {
      console.error('Error deleting review:', error);
      alert('Error deleting review.');
    }
  };
  


  if (loading) return <p>Loading event details...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="event-details">
  <h1>{event.title}</h1>
  <p>{event.description}</p>
  <p>
    <strong>Date:</strong> {new Date(event.date).toLocaleDateString()} - {event.time}
  </p>
  <p>
  <strong>Location:</strong>{' '}
  {event.userLocationInput && event.location.toLowerCase() === 'other'
    ? <span>{event.userLocationInput}</span>
    : <span>{event.location}</span>}
</p>

<p>
  <strong>Category:</strong>{' '}
  {event.userCategoryInput && event.category.toLowerCase() === 'other'
    ? <span>{event.userCategoryInput}</span>
    : <span>{event.category}</span>}
</p>


  <p>
    <strong>Price:</strong> {event.price === 0 ? 'Free' : `$${event.price}`}
  </p>
  <img src={event.imageUrl} alt={event.title} className="event-image" />
  <p>Tickets Available: {event.ticketsAvailable}</p>



      {notification && <p>{notification}</p>}

      {event.ticketsAvailable > 0 ? (
        isRSVPed ? (
          <button disabled className="rsvp-button-disabled">You're attending this event</button>
        ) : (
          <button onClick={handleRSVP} className="rsvp-button" disabled={loading}>
      {loading ? 'Processing...' : 'RSVP and Purchase Ticket'}</button> )
      ) : (
        <p>No tickets available</p>
      )}

      <h2>Reviews</h2>
      <ReviewForm eventId={id} addNewReview={addNewReview} user={user} />
      <div className="reviews">
        {loadingReviews ? <p>Loading reviews...</p> : 
          reviews.length === 0 ? (
            <p>No reviews yet. Be the first to add one!</p>
          ) : (
            reviews.map((review, index) => (
              <div key={index} className="review">
                <p><strong>{review.userId?.name || 'Anonymous'}</strong></p>
                <div className="star-rating">
                  {[1, 2, 3, 4, 5].map((num) => (
                    <span key={num} className={`star ${review.rating >= num ? 'filled' : ''}`}>★</span>
                  ))}
                </div>
                <p className="comment">{review.comment}</p>
                <div className="review-footer">
                  <p><small>{new Date(review.date).toLocaleString()}</small></p>
                  {isAdmin && (
                    <button onClick={() => handleDeleteReview(review.userId, event._id, review.comment)} className="delete-review-button">
                      Delete Review
                    </button>
                  )}
                </div>
              </div>
            ))
          )
        }
      </div>

      <h2>Chat with Attendees</h2>
      <Chat eventId={id} userName={user?.name || 'Guest'} />
    </div>
  );
};


export default EventDetailsPage;
