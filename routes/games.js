const express = require("express");
const asyncHandler = require("express-async-handler");
const Game = require("../models/Game");
const auth = require("../middleware/auth");
const router = express.Router();

// Create a new game (Protected)
router.post(
  "/",
  auth,
  asyncHandler(async (req, res) => {
    const newGame = new Game({
      ...req.body,
      creator: req.user,
    });
    const game = await newGame.save();
    res.status(201).json(game);
  })
);

// Get all games (Public)
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const games = await Game.find().populate("creator", "username");
    res.json(games);
  })
);

// Get a specific game (Public)
router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const game = await Game.findById(req.params.id)
      .populate("creator", "username")
      .populate("participants", "username");
    if (!game) {
      res.status(404);
      throw new Error("Game not found");
    }
    res.json(game);
  })
);

// Update a game (Protected)
router.put(
  "/:id",
  auth,
  asyncHandler(async (req, res) => {
    let game = await Game.findById(req.params.id);
    if (!game) {
      res.status(404);
      throw new Error("Game not found");
    }

    if (game.creator.toString() !== req.user) {
      res.status(401);
      throw new Error("User not authorized");
    }

    game = await Game.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(game);
  })
);

// Delete a game (Protected)
router.delete(
  "/:id",
  auth,
  asyncHandler(async (req, res) => {
    const game = await Game.findById(req.params.id);
    if (!game) {
      res.status(404);
      throw new Error("Game not found");
    }

    if (game.creator.toString() !== req.user) {
      res.status(401);
      throw new Error("User not authorized");
    }

    await game.remove();
    res.json({ message: "Game deleted successfully" });
  })
);

// Join a game (Protected)
router.post(
  "/:id/join",
  auth,
  asyncHandler(async (req, res) => {
    const game = await Game.findById(req.params.id);
    if (!game) {
      res.status(404);
      throw new Error("Game not found");
    }

    if (game.participants.includes(req.user)) {
      res.status(400);
      throw new Error("User already joined this game");
    }

    if (game.participants.length >= game.maxParticipants) {
      res.status(400);
      throw new Error("Game is full");
    }

    game.participants.push(req.user);
    await game.save();

    res.json(game);
  })
);

module.exports = router;
