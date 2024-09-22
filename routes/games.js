const express = require('express');
const Game = require('../models/Game');
const auth = require('../middleware/auth');
const router = express.Router();

// Create a new game (Protected)
router.post('/', auth, async (req, res) => {
  try {
    const newGame = new Game({
      ...req.body,
      creator: req.user // req.user is set by the auth middleware
    });
    const game = await newGame.save();
    res.status(201).json(game);
  } catch (error) {
    res.status(400).json({ message: 'Error creating game', error: error.message });
  }
});

// Get all games (Public)
router.get('/', async (req, res) => {
  try {
    const games = await Game.find().populate('creator', 'username');
    res.json(games);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching games', error: error.message });
  }
});

// Get a specific game (Public)
router.get('/:id', async (req, res) => {
  try {
    const game = await Game.findById(req.params.id)
      .populate('creator', 'username')
      .populate('participants', 'username');
    if (!game) return res.status(404).json({ message: 'Game not found' });
    res.json(game);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching game', error: error.message });
  }
});

// Update a game (Protected)
router.put('/:id', auth, async (req, res) => {
  try {
    let game = await Game.findById(req.params.id);
    if (!game) return res.status(404).json({ message: 'Game not found' });
    
    // Check if the user is the creator of the game
    if (game.creator.toString() !== req.user) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    game = await Game.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(game);
  } catch (error) {
    res.status(400).json({ message: 'Error updating game', error: error.message });
  }
});

// Delete a game (Protected)
router.delete('/:id', auth, async (req, res) => {
  try {
    const game = await Game.findById(req.params.id);
    if (!game) return res.status(404).json({ message: 'Game not found' });

    // Check if the user is the creator of the game
    if (game.creator.toString() !== req.user) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    await game.remove();
    res.json({ message: 'Game deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting game', error: error.message });
  }
});

// Join a game (Protected)
router.post('/:id/join', auth, async (req, res) => {
  try {
    const game = await Game.findById(req.params.id);
    if (!game) return res.status(404).json({ message: 'Game not found' });

    // Check if user is already a participant
    if (game.participants.includes(req.user)) {
      return res.status(400).json({ message: 'User already joined this game' });
    }

    // Check if game is full
    if (game.participants.length >= game.maxParticipants) {
      return res.status(400).json({ message: 'Game is full' });
    }

    game.participants.push(req.user);
    await game.save();

    res.json(game);
  } catch (error) {
    res.status(500).json({ message: 'Error joining game', error: error.message });
  }
});

module.exports = router;