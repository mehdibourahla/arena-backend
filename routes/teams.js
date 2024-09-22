const express = require('express');
const Team = require('../models/Team');
const auth = require('../middleware/auth');
const router = express.Router();

// Create a new team (Protected)
router.post('/', auth, async (req, res) => {
  try {
    const newTeam = new Team({
      ...req.body,
      captain: req.user,
      members: [req.user] // Add the creator as the first member
    });
    const team = await newTeam.save();
    res.status(201).json(team);
  } catch (error) {
    res.status(400).json({ message: 'Error creating team', error: error.message });
  }
});

// Get all teams (Public)
router.get('/', async (req, res) => {
  try {
    const teams = await Team.find().populate('captain', 'username');
    res.json(teams);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching teams', error: error.message });
  }
});

// Get a specific team (Public)
router.get('/:id', async (req, res) => {
  try {
    const team = await Team.findById(req.params.id)
      .populate('captain', 'username')
      .populate('members', 'username');
    if (!team) return res.status(404).json({ message: 'Team not found' });
    res.json(team);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching team', error: error.message });
  }
});

// Update a team (Protected)
router.put('/:id', auth, async (req, res) => {
  try {
    let team = await Team.findById(req.params.id);
    if (!team) return res.status(404).json({ message: 'Team not found' });
    
    // Check if the user is the captain of the team
    if (team.captain.toString() !== req.user) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    team = await Team.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(team);
  } catch (error) {
    res.status(400).json({ message: 'Error updating team', error: error.message });
  }
});

// Delete a team (Protected)
router.delete('/:id', auth, async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    if (!team) return res.status(404).json({ message: 'Team not found' });

    // Check if the user is the captain of the team
    if (team.captain.toString() !== req.user) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    await team.remove();
    res.json({ message: 'Team deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting team', error: error.message });
  }
});

// Join a team (Protected)
router.post('/:id/join', auth, async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    if (!team) return res.status(404).json({ message: 'Team not found' });

    // Check if user is already a member
    if (team.members.includes(req.user)) {
      return res.status(400).json({ message: 'User is already a member of this team' });
    }

    team.members.push(req.user);
    await team.save();

    res.json(team);
  } catch (error) {
    res.status(500).json({ message: 'Error joining team', error: error.message });
  }
});

module.exports = router;