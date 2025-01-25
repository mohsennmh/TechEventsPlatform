import React from 'react';
import { Link } from 'react-router-dom';
import '../assets/styles/EventCard.css';

const EventCard = ({ event }) => {
  // Check if location or category is 'other', and use custom values if available
  const displayLocation = (event.location === 'other' && event.userLocationInput)
    ? event.userLocationInput 
    : event.location;

  const displayCategory = (event.category === 'other' && event.userCategoryInput)
    ? event.userCategoryInput 
    : event.category;

  return (
    <div className="event-card">
      <img src={event.imageUrl} alt={event.title} className="eventcard-image" />
      <div className="event-details">
        <h3 className="event-title">{event.title}</h3>
        <p className="event-date-location">
          <span>
            <i className="fas fa-calendar-alt"></i>{' '}
            {new Date(event.date).toLocaleDateString()}
          </span>
          <span>
            <i className="fas fa-map-marker-alt"></i> {displayLocation}
          </span>
          <span>
            <i className="fas fa-tag"></i> {displayCategory}
          </span>
        </p>
        <p className="event-description">{event.description}</p>
        <Link to={`/events/${event._id}`} className="register-button">
          Learn More
        </Link>
      </div>
    </div>
  );
};

export default EventCard;
