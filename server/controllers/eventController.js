require('dotenv').config();
const Event = require('../models/Event');
const nodemailer = require('nodemailer');
const User = require('../models/User');
const crypto = require('crypto');
const mongoose = require('mongoose');

// Utility function to send email

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER, // Use environment variables for security
        pass: process.env.EMAIL_PASS,
      },
    });
const sendNotificationEmail = async (email, eventName) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: `RSVP Confirmation for ${eventName}`,
      text: `You have successfully RSVP'd and purchased a ticket for the event: ${eventName}. Enjoy the event!`,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.response);
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

// Get all events
exports.getAllEvents = async (req, res) => {
  try {
    const events = await Event.find();
    res.status(200).json(events);
  } catch (err) {
    console.error('Error fetching events:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};


// Get event by ID
exports.getEventById = async (req, res) => {
  const { eventId } = req.params;
  try {
    const event = await Event.findById(eventId).populate('attendees', 'name email');
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    res.status(200).json(event);
  } catch (err) {
    console.error('Error fetching event:', err);
    res.status(500).json({ message: 'Server error' });
  }
};



// Create an event
exports.createEvent = async (req, res) => {
  try {
    console.log('Request body:', req.body); // Log the incoming request

    // Destructure fields from the body
    const { title, date, time, location, category, ticketsAvailable, userLocationInput, userCategoryInput } = req.body;

    // Validate required fields
    if (!title || !date || !time || !location || !category || !ticketsAvailable) {
      console.log('Missing required fields');
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Handle custom input for 'other' location and category
    let eventLocation = location;
    let eventCategory = category;

    if (location === 'other' && userLocationInput) {
      eventLocation = userLocationInput; // Use the custom input for location
    }

    if (category === 'other' && userCategoryInput) {
      eventCategory = userCategoryInput; // Use the custom input for category
    }

    // Prepare the data to be saved
    const eventData = {
      title,
      date,
      time,
      location: eventLocation,
      category: eventCategory,
      ticketsAvailable
    };

    // Create the new event
    const newEvent = new Event(eventData);
    const savedEvent = await newEvent.save();

    console.log('Event saved successfully:', savedEvent); // Log saved event
    res.status(201).json(savedEvent); // Send success response
  } catch (err) {
    console.error('Error in createEvent:', err.message); // Log the error
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};




// Update an event
exports.updateEvent = async (req, res) => {
  const { eventId } = req.params;
  const { location, category, userLocationInput, userCategoryInput } = req.body;

  try {
    console.log('Updating event with ID:', eventId);
    console.log('Request body for update:', req.body); // Log the incoming request for debugging

    // Check if 'other' was selected for location/category and replace with user input
    if (location === 'other' && userLocationInput) {
      req.body.location = userLocationInput; // Use custom location input
    }
    if (category === 'other' && userCategoryInput) {
      req.body.category = userCategoryInput; // Use custom category input
    }

    // Update the event in the database
    const updatedEvent = await Event.findByIdAndUpdate(eventId, req.body, { new: true });

    if (!updatedEvent) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.status(200).json(updatedEvent); // Send back the updated event
  } catch (err) {
    console.error('Error updating event:', err.message); // Log error message
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};



// Delete an event
exports.deleteEvent = async (req, res) => {
  const { eventId } = req.params;
  try {
    const event = await Event.findByIdAndDelete(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    res.status(200).json({ message: 'Event deleted successfully' });
  } catch (err) {
    console.error('Error deleting event:', err.message);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};


exports.rsvpEvent = async (req, res) => {
  const { eventId } = req.params;
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const event = await Event.findById(eventId).session(session);
    const user = await User.findById(req.user.id).session(session);

    if ( !user) {
      await session.abortTransaction();
      return res.status(404).json({ message: ' user not found' });
    }
    if ( !event) {
      await session.abortTransaction();
      return res.status(404).json({ message: ' event not found' });
    }

    if (event.ticketsAvailable <= 0) {
      await session.abortTransaction();
      return res.status(400).json({ message: 'No tickets available' });
    }

    if (event.attendees.includes(user.id)) {
      await session.abortTransaction();
      return res.status(400).json({ message: 'You already RSVP\'d to this event' });
    }

    event.attendees.push(user.id);
    event.ticketsAvailable -= 1;
    event.ticketsSold += 1;

    await event.save({ session });
    await session.commitTransaction();

    sendNotificationEmail(user.email, event.title);
    res.status(200).json({ message: 'RSVP successful' });
  } catch (err) {
    await session.abortTransaction();
    console.error('RSVP Error:', err);
    res.status(500).json({ message: 'Server error during RSVP' });
  } finally {
    session.endSession();
  }
};



// Get events the user has RSVP'd to
exports.getRSVPedEvents = async (req, res) => {
  const userId = req.user.id;

  try {
    const events = await Event.find({ attendees: userId }).populate('attendees', 'name email');

    if (!events || events.length === 0) {
      return res.status(404).json({ message: 'No RSVP\'d events found for this user' });
    }

    res.status(200).json(events);
  } catch (err) {
    console.error('Error fetching RSVP\'d events:', err);
    res.status(500).json({ message: 'Server error while fetching RSVP\'d events' });
  }
};
