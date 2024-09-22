const mongoose = require('mongoose');

const TeamSchema = new mongoose.Schema({
  name: { type: String, required: true },
  sport: { type: String, required: true },
  captain: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  dateCreated: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Team', TeamSchema);