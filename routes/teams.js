const express = require("express");
const asyncHandler = require("express-async-handler");
const Team = require("../models/Team");
const auth = require("../middleware/auth");
const router = express.Router();

// Create a new team (Protected)
router.post(
  "/",
  auth,
  asyncHandler(async (req, res) => {
    const newTeam = new Team({
      ...req.body,
      captain: req.user,
      members: [req.user], // Add the creator as the first member
    });
    const team = await newTeam.save();
    res.status(201).json(team);
  })
);

// Get all teams (Public)
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const teams = await Team.find().populate("captain", "username");
    res.json(teams);
  })
);

// Get a specific team (Public)
router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const team = await Team.findById(req.params.id)
      .populate("captain", "username")
      .populate("members", "username");
    if (!team) {
      res.status(404);
      throw new Error("Team not found");
    }
    res.json(team);
  })
);

// Update a team (Protected)
router.put(
  "/:id",
  auth,
  asyncHandler(async (req, res) => {
    let team = await Team.findById(req.params.id);
    if (!team) {
      res.status(404);
      throw new Error("Team not found");
    }

    if (team.captain.toString() !== req.user) {
      res.status(401);
      throw new Error("User not authorized");
    }

    team = await Team.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(team);
  })
);

// Delete a team (Protected)
router.delete(
  "/:id",
  auth,
  asyncHandler(async (req, res) => {
    const team = await Team.findById(req.params.id);
    if (!team) {
      res.status(404);
      throw new Error("Team not found");
    }

    if (team.captain.toString() !== req.user) {
      res.status(401);
      throw new Error("User not authorized");
    }

    await team.remove();
    res.json({ message: "Team deleted successfully" });
  })
);

// Join a team (Protected)
router.post(
  "/:id/join",
  auth,
  asyncHandler(async (req, res) => {
    const team = await Team.findById(req.params.id);
    if (!team) {
      res.status(404);
      throw new Error("Team not found");
    }

    if (team.members.includes(req.user)) {
      res.status(400);
      throw new Error("User is already a member of this team");
    }

    team.members.push(req.user);
    await team.save();

    res.json(team);
  })
);

module.exports = router;
