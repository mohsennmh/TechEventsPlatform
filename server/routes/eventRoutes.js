const express = require('express');
const {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  rsvpEvent,
  getRSVPedEvents,
  
} = require('../controllers/eventController');
const { verifyToken, organizerAuth } = require('../middleware/authMiddleware');

const router = express.Router();


router.get('/events', getAllEvents);


router.get('/events/:eventId', getEventById);

// Create a new event (Organizer only)
router.post('/events', verifyToken, organizerAuth, createEvent);

// Update an event (Organizer only)
router.post('/events/:eventId', verifyToken, organizerAuth, updateEvent);

// Delete an event (Organizer or Admin only)
router.delete('/events/:eventId', verifyToken, organizerAuth, deleteEvent);


router.post('/events/:eventId/rsvp', verifyToken, rsvpEvent);


router.get('/rsvp-events', verifyToken, getRSVPedEvents);

module.exports = router;
