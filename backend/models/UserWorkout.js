// backend/models/UserWorkout.js
const mongoose = require("mongoose");

const userWorkoutSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  workoutPlanId: { type: String, required: true },
  completedAt: { type: Date, default: Date.now },
});

const UserWorkout = mongoose.model("UserWorkout", userWorkoutSchema);
module.exports = UserWorkout;
