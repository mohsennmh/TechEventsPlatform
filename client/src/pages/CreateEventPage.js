import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../assets/styles/CreateEventPage.css';

const CreateEventPage = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    customLocation: '',
    category: '',
    customCategory: '',
    price: '',
    imageUrl: '',
    ticketsAvailable: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const categories = [
    { value: 'workshop', label: 'Workshop' },
    { value: 'conference', label: 'Conference' },
    { value: 'meetup', label: 'Meetup' },
    { value: 'webinar', label: 'Webinar' },
    { value: 'hackathon', label: 'Hackathon' },
    { value: 'networking', label: 'Networking' },
  ];

  const locations = [
    { value: 'beirut', label: 'Beirut' },
    { value: 'tripoli', label: 'Tripoli' },
    { value: 'sidon', label: 'Sidon' },
    { value: 'tyre', label: 'Tyre' },
    { value: 'zahle', label: 'Zahle' },
    { value: 'jounieh', label: 'Jounieh' },
    { value: 'batroun', label: 'Batroun' },
    { value: 'baalbek', label: 'Baalbek' },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const token = localStorage.getItem('token');
    if (!token) {
      alert('You must be logged in to create an event.');
      setLoading(false);
      return;
    }

    try {
      // Send request to backend
      const response = await axios.post(
        'http://localhost:5000/api/events',
        {
          ...formData,
          location:
            formData.location === 'other'
              ? formData.customLocation
              : formData.location,
          category:
            formData.category === 'other'
              ? formData.customCategory
              : formData.category,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log('Event created:', response.data);
      alert('Event created successfully!');
      navigate('/');
    } catch (err) {
      console.error('Error creating event:', err.response || err.message);
      setError(
        err.response?.data?.message || 'Something went wrong. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-event">
      <h1>Create Event</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="title"
          placeholder="Event Title"
          value={formData.title}
          onChange={handleChange}
          required
        />
        <textarea
          name="description"
          placeholder="Event Description"
          value={formData.description}
          onChange={handleChange}
        />
        <input
          type="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
          required
        />
        <input
          type="time"
          name="time"
          value={formData.time}
          onChange={handleChange}
          required
        />

        <label>Location</label>
        <select
          name="location"
          value={formData.location}
          onChange={handleChange}
          required
        >
          <option value="">Select a Location</option>
          {locations.map((loc) => (
            <option key={loc.value} value={loc.value}>
              {loc.label}
            </option>
          ))}
          <option value="other">Other</option>
        </select>
        {formData.location === 'other' && (
          <input
            type="text"
            name="customLocation"
            placeholder="Enter your location"
            value={formData.customLocation}
            onChange={handleChange}
            required
          />
        )}

        <label>Category</label>
        <select
          name="category"
          value={formData.category}
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
        {formData.category === 'other' && (
          <input
            type="text"
            name="customCategory"
            placeholder="Enter your category"
            value={formData.customCategory}
            onChange={handleChange}
            required
          />
        )}

        <input
          type="number"
          name="price"
          placeholder="Price (0 for Free)"
          value={formData.price}
          onChange={handleChange}
        />
        <input
          type="text"
          name="imageUrl"
          placeholder="Image URL"
          value={formData.imageUrl}
          onChange={handleChange}
        />
        <input
          type="number"
          name="ticketsAvailable"
          placeholder="Tickets Available"
          value={formData.ticketsAvailable}
          onChange={handleChange}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Creating...' : 'Create Event'}
        </button>
      </form>
      {error && <p className="error-message">{error}</p>}
    </div>
  );
};

export default CreateEventPage;
