import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../assets/styles/UserDashboardPage.css';

const UserDashboardPage = () => {
  const [rsvpEvents, setRsvpEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRSVPedEvents = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('You need to be logged in to view your RSVP\'d events.');
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get('http://localhost:5000/api/auth/rsvp-events', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setRsvpEvents(response.data);
        setLoading(false);
      } catch (err) {
        setError('Error fetching RSVP\'d events');
        console.error('Error fetching events:', err);
        setLoading(false);
      }
    };

    fetchRSVPedEvents();
  }, []);

  if (loading) return <p className="user-dashboard-loading-message">Loading your RSVP\'d events...</p>;
  if (error) return <p className="user-dashboard-error-message">{error}</p>;

  return (
    <div className="user-dashboard-container">
      <h1 className="user-dashboard-title">Your RSVP\'d Events</h1>
      {rsvpEvents.length === 0 ? (
        <p className="user-dashboard-no-events-message">You haven\'t RSVP\'d to any events yet.</p>
      ) : (
        <div className="user-dashboard-event-grid">
          {rsvpEvents.map((event) => (
            <div key={event._id} className="user-dashboard-event-card" style={{ backgroundImage: `url(${event.image})` }}>
            <div className="user-dashboard-event-details">
              <h2 className="user-dashboard-event-title">{event.title}</h2>
              <p className="user-dashboard-event-description">{event.description}</p>
              <p className="user-dashboard-event-date">
                <i className="fas fa-calendar-alt"></i> {new Date(event.date).toLocaleDateString()} - {event.time}
              </p>
              <p className="user-dashboard-event-location">
                <i className="fas fa-map-marker-alt"></i> {event.location}
              </p>
              <p className="user-dashboard-event-category">
                <i className="fas fa-tag"></i> {event.category}
              </p>
            </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserDashboardPage;
