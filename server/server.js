require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const userRoutes = require('./routes/userRoutes');
const eventRoutes = require('./routes/eventRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const adminRoutes = require('./routes/adminRoutes');
const Chat = require('./models/Chat');
const chatRoutes = require('./routes/chatRoutes');

// Initialize Express App
const app = express();
const httpServer = http.createServer(app);

// Initialize Socket.IO
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3000", // Replace with your frontend URL
    methods: ["GET", "POST"],
  },
});

// Middleware
app.use(express.json());
app.use(cors());

// Serve static files (images, etc.) from the 'uploads' directory
app.use('/uploads', express.static('uploads'));

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('Error connecting to MongoDB:', err));

// Routes
app.use('/api/auth', userRoutes);
app.use('/api', eventRoutes);
app.use('/api', reviewRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/chats', chatRoutes);


// Socket.IO setup for real-time chat
let users = {}; // To track users in different rooms (events)


// Socket.IO connection
io.on('connection', (socket) => {
  
  // Join a specific event chat room
  socket.on('joinRoom', (eventId) => {
    socket.join(eventId);
    users[socket.id] = eventId; // Store the user's event ID
  });

  // Handle message events
  socket.on('sendMessage', async (messageData) => {
    const { eventId, user, text, time } = messageData;

    // Emit the message to all users in the same event room
    io.to(eventId).emit('receiveMessage', messageData);

    // Create a new message document
  const newChat = new Chat({
    eventId,   // Associate the message with an event
    user,
    text,
    time,
  });
    await newChat.save();
    io.emit('receiveMessage', newChat); // Broadcast message to all connected clients
  });

  socket.on('disconnect', () => {
    
    delete users[socket.id];
  });
});

// // Global Error Handler
// app.use((err, req, res, next) => {
//   console.error(err.stack);
//   res.status(500).json({ message: 'Server error' });
// });

// Start Server
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
