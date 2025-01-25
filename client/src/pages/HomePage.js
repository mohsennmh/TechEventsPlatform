import React, { useState, useEffect } from 'react';
import axios from 'axios';
import EventCard from '../components/EventCard'; // Component for rendering individual events
import Calendar from 'react-calendar'; // Calendar component
// import 'react-calendar/dist/Calendar.css'; // Calendar styles
import '../assets/styles/homepage.css'; // Custom styles for homepage

const Homepage = () => {
  const [events, setEvents] = useState([]); // All events fetched from the API
  const [filteredEvents, setFilteredEvents] = useState([]); // Events after applying filters
  const [searchLocation, setSearchLocation] = useState(''); // User-input for location filter
  const [category, setCategory] = useState(''); // User-input for category filter
  const [selectedDate, setSelectedDate] = useState(''); // Selected date from the calendar
  const [loading, setLoading] = useState(true); // Loading state for the page

  // Fetch events from the API on component mount
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/events'); // Replace with your backend API
        setEvents(response.data); // Save all events
        setFilteredEvents(response.data); // Initially display all events
        setLoading(false); // Data fetched, stop loading
      } catch (error) {
        console.error('Error fetching events:', error);
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  // Apply filters based on location, category, and selected date
  const applyFilters = () => {
    let filtered = [...events]; // Start with all events

    // Filter by location if provided
    if (searchLocation.trim()) {
      filtered = filtered.filter((event) =>
        event.location.toLowerCase().includes(searchLocation.toLowerCase())
      );
    }

    // Filter by category if provided
    if (category.trim()) {
      filtered = filtered.filter((event) =>
        event.category.toLowerCase() === category.toLowerCase()
      );
    }

    // Filter by calendar date if provided
    if (selectedDate) {
      filtered = filtered.filter((event) => {
        const eventDate = new Date(event.date);
        return eventDate.toDateString() === new Date(selectedDate).toDateString();
      });
    }

    setFilteredEvents(filtered); // Update the filtered events
  };

  // Trigger filters when location, category, or date input changes
  useEffect(() => {
    applyFilters(); // Reapply filters whenever location, category, or date changes
  }, [searchLocation, category, selectedDate]);

  // Handle date change from calendar
  const handleDateChange = (newDate) => {
    setSelectedDate(newDate); // Update selected date
    applyFilters(); // Apply all filters after date change
  };

  // Reset all filters
  const resetFilters = () => {
    setSearchLocation('');
    setCategory('');
    setSelectedDate('');
    setFilteredEvents(events); // Reset to the original list of events
  };

  if (loading) return <p>Loading events...</p>;

  return (
    <div className="homepage">
      <h1 className="homepage-title">Discover Tech Events</h1>

      {/* Filters Section */}
      <div className="filters">
        <input
          type="text"
          placeholder="Search by location..."
          value={searchLocation}
          onChange={(e) => setSearchLocation(e.target.value)}
        />
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">All Categories</option>
          <option value="workshop">Workshop</option>
          <option value="conference">Conference</option>
          <option value="meetup">Meetup</option>
          <option value="webinar">Webinar</option>
          <option value="hackathon">Hackathon</option>
          <option value="networking">Networking</option>
        </select>
        <button className="reset-button" onClick={resetFilters}>
          Reset Filters
        </button>
      </div>

      {/* Calendar Section */}
      <div className="calendar-container">
        <Calendar 
          onChange={handleDateChange} // Update selectedDate when a user selects a date
          value={selectedDate ? new Date(selectedDate) : new Date()}
        />
      </div>

      {/* Event Grid Section */}
      <div className="event-grid">
        {filteredEvents.length === 0 ? (
          <p>No events match your filters.</p>
        ) : (
          filteredEvents.map((event) => (
            <EventCard key={event._id} event={event} />
          ))
        )}
      </div>
    </div>
  );
};

export default Homepage;
