const mongoose = require('mongoose');

const GameSchema = new mongoose.Schema({
  name: { type: String, required: true },
  sport: { type: String, required: true },
  creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  dateTime: { type: Date, required: true },
  location: {
    type: { type: String, default: 'Point' },
    coordinates: [Number]
  },
  maxParticipants: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['upcoming', 'in-progress', 'completed'], 
    default: 'upcoming' 
  },
  createdAt: { type: Date, default: Date.now }
});

// Index for geospatial queries
GameSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Game', GameSchema);