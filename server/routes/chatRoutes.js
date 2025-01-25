// // chatRoutes.js
// const express = require('express');
// const router = express.Router();
// const Chat = require('../models/Chat'); // Import your Chat model

// // Middleware to check authentication
// const verifyToken = require('../middleware/authMiddleware');

// // GET all messages for a specific event
// router.get('/:eventId', async (req, res) => {
//   try {
//     const messages = await Chat.find({ eventId: req.params.eventId }).sort({ createdAt: 1 }); // Sort by creation date
//     res.json(messages);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: 'Error fetching messages' });
//   }
// });

// // POST a new chat message
// // POST a new chat message
// router.post('/:eventId', verifyToken, async (req, res) => {
//   const { message } = req.body;
//   const { eventId } = req.params;
//   const user = req.user; // Assuming you attach the user to the request after authentication

//   if (!message) {
//     return res.status(400).json({ message: 'Message is required' });
//   }

//   try {
//     const newMessage = new Chat({
//       eventId,
//       user: user.name, // Assuming user has a `name` field
//       text: message,
//       time: new Date().toLocaleTimeString(),
//     });

//     await newMessage.save();

//     // Send the message back in the response
//     res.status(201).json(newMessage);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: 'Error saving message' });
//   }
// });

// module.exports = router;


// chatRoutes.js
const express = require('express');
const router = express.Router();
const {verifyToken} = require('../middleware/authMiddleware');
const {
  getMessages,
  postMessage,
} = require('../controllers/chatController'); // Import your chat controller

// GET all messages for a specific event
router.get('/:eventId', getMessages);

// POST a new chat message
router.post('/:eventId', verifyToken, postMessage);

module.exports = router;
