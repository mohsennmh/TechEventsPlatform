const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event' },
  user: { type: String, required: true },
  text: { type: String, required: true },
  time: { type: String, required: true },
});

module.exports = mongoose.model('Chat', chatSchema);
