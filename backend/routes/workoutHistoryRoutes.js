const express = require('express');
const router = express.Router();
const WorkoutHistory = require('../models/WorkoutHistory');
const { getUserIdFromRequest } = require('../utils/getClerkUser');

router.post('/', async (req, res) => {
  try {
    // Get the user ID from the request
    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Proceed with saving the workout history
    const { workoutName, reps, timestamp } = req.body;

    const newHistory = await WorkoutHistory.create({
      userId,
      workoutName,
      reps,
      timestamp,
    });

    return res.status(201).json({ success: true, data: newHistory });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
