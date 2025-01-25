const Chat = require('../models/Chat'); // Import the Chat model

// GET all messages for a specific event
exports.getMessages = async (req, res) => {
  const { eventId } = req.params;

  // Validate eventId
  if (!eventId) {
    return res.status(400).json({ message: 'Event ID is required' });
  }

  try {
    // Fetch messages for the specified event and sort them by creation time
    const messages = await Chat.find({ eventId }).sort({ createdAt: 1 });
    res.status(200).json(messages);
  } catch (err) {
    console.error('Error fetching messages:', err.message);
    res.status(500).json({ message: 'Error fetching messages' });
  }
};

// POST a new chat message
exports.postMessage = async (req, res) => {
  const { eventId } = req.params;
  const { text, user } = req.body; // Get `text` and `user` from the request body
  const authenticatedUser = req.user; // Get the logged-in user from middleware

  if (!text || !eventId) {
    return res.status(400).json({ message: 'Message text and eventId are required.' });
  }

  try {
    const newMessage = new Chat({
      eventId,
      user: user || authenticatedUser?.name || 'Guest', // Use the user from the request or authentication
      text,
      time: new Date().toLocaleTimeString(),
    });

    await newMessage.save();

    res.status(201).json(newMessage); // Return the newly created message
  } catch (err) {
    console.error('Error saving message:', err.message);
    res.status(500).json({ message: 'Server error while saving the message' });
  }
};
