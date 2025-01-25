const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  title: { type: String, required: true },
  description: { type: String },
  date: { type: Date, required: true },
  time: { type: String },
  attendees: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  location: { type: String },
  category: { type: String },
  price: { type: Number, default: 0 },
  imageUrl: { type: String }, // Optional image URL for event visuals
  ticketsAvailable: { type: Number, required: true },
  ticketsSold: { type: Number, default: 0 },
  reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Review' }],
},
{ timestamps: true });


module.exports = mongoose.model('Event', eventSchema);
