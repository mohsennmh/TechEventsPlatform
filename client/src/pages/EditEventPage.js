import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import '../assets/styles/EditEventPage.css';  // Import the styles for this component

const EditEventPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [eventData, setEventData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    category: '',
    price: 0,
    imageUrl: '',
    ticketsAvailable: 0,
    customLocation: '',  // For custom location input
    customCategory: '',  // For custom category input
  });

  const categories = [
    { value: 'workshop', label: 'Workshop' },
    { value: 'conference', label: 'Conference' },
    { value: 'meetup', label: 'Meetup' },
    { value: 'webinar', label: 'Webinar' },
    { value: 'hackathon', label: 'Hackathon' },
    { value: 'networking', label: 'Networking' },
  ];

  // Predefined locations in Lebanon
  const locations = [
    { value: 'beirut', label: 'Beirut' },
    { value: 'tripoli', label: 'Tripoli' },
    { value: 'sidon', label: 'Sidon' },
    { value: 'tyre', label: 'Tyre' },
    { value: 'zahle', label: 'Zahle' },
    { value: 'jounieh', label: 'Jounieh' },
    { value: 'batroun', label: 'Batroun' },
    { value: 'baalbek', label: 'Baalbek' },
    { value: 'other', label: 'Other' }, // Option for custom location
  ];

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        const response = await axios.get(`http://localhost:5000/api/events/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setEventData(response.data);
        setLoading(false);
      } catch (err) {
        setError('Error fetching event details.');
        setLoading(false);
      }
    };

    fetchEventDetails();
  }, [id, navigate]);

  const handleChange = (e) => {
    setEventData({ ...eventData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please log in to edit the event.');
      return;
    }

    try {
      await axios.post(`http://localhost:5000/api/events/${id}`, eventData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert('Event updated successfully!');
      navigate('/dashboard');
    } catch (err) {
      setError('Error updating event.');
      console.error(err);
    }
  };

  if (loading) return <p>Loading event details...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="edit-event">
      <h1>Edit Event</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="title"
          placeholder="Event Title"
          value={eventData.title}
          onChange={handleChange}
          required
        />
        <textarea
          name="description"
          placeholder="Event Description"
          value={eventData.description}
          onChange={handleChange}
          required
        />
        <input
          type="date"
          name="date"
          value={eventData.date}
          onChange={handleChange}
          required
        />
        <input
          type="time"
          name="time"
          value={eventData.time}
          onChange={handleChange}
          required
        />

        {/* Location Dropdown */}
        <label>Location</label>
        <select
          name="location"
          value={eventData.location}
          onChange={handleChange}
          required
        >
          <option value="">Select a Location</option>
          {locations.map((loc) => (
            <option key={loc.value} value={loc.value}>
              {loc.label}
            </option>
          ))}
        </select>

        {/* Custom Location Input (Only show if "Other" is selected) */}
        {eventData.location === 'other' && (
          <input
            type="text"
            name="customLocation"
            placeholder="Enter your custom location"
            value={eventData.customLocation}
            onChange={handleChange}
            required
          />
        )}

        {/* Category Dropdown */}
        <label>Category</label>
        <select
          name="category"
          value={eventData.category}
          onChange={handleChange}
          required
        >
          <option value="">Select a Category</option>
          {categories.map((cat) => (
            <option key={cat.value} value={cat.value}>
              {cat.label}
            </option>
          ))}
          <option value="other">Other</option>
        </select>

        {/* Custom Category Input (Only show if "Other" is selected) */}
        {eventData.category === 'other' && (
          <input
            type="text"
            name="customCategory"
            placeholder="Enter your custom category"
            value={eventData.customCategory}
            onChange={handleChange}
            required
          />
        )}

        <input
          type="number"
          name="price"
          placeholder="Ticket Price"
          value={eventData.price}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="imageUrl"
          placeholder="Image URL"
          value={eventData.imageUrl}
          onChange={handleChange}
        />
        <input
          type="number"
          name="ticketsAvailable"
          placeholder="Tickets Available"
          value={eventData.ticketsAvailable}
          onChange={handleChange}
          required
        />
        <button type="submit">Update Event</button>
      </form>
    </div>
  );
};

export default EditEventPage;
