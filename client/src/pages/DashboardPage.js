import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../assets/styles/DashboardPage.css';

const DashboardPage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchEvents = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.get('http://localhost:5000/api/events', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEvents(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching events:', err.response || err.message);
      setError('Failed to fetch events.');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleDelete = async (eventId) => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please log in to delete an event.');
      return;
    }
  
    const confirmDelete = window.confirm('Are you sure you want to delete this event?');
    if (!confirmDelete) return;
  
    try {
      await axios.delete(`http://localhost:5000/api/events/${eventId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert('Event deleted successfully.');
      setEvents(events.filter((event) => event._id !== eventId));
    } catch (err) {
      console.error('Error deleting event:', err.response || err.message);
      alert('Failed to delete event.');
    }
  };
  

  const handleEdit = (eventId) => {
    navigate(`/edit-event/${eventId}`);
  };

  const handleCreate = () => {
    navigate('/create-event');
  };

  if (loading) return <p>Loading events...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="dashboard">
      <h1>Event Dashboard</h1>
      <button onClick={handleCreate} className="create-button">Create New Event</button>
      <div className="dashboard-events">
        {events.map((event) => (
          <div key={event._id} className="dashboard-event-card">
            <h3>{event.title}</h3>
            <p><strong>Date:</strong> {new Date(event.date).toLocaleDateString()}</p>
            <p><strong>Location:</strong> {event.location}</p>
            <button onClick={() => handleEdit(event._id)} className="edit-button">Edit</button>
            <button onClick={() => handleDelete(event._id)} className="delete-button">Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DashboardPage;
