// models/WorkoutHistory.
const mongoose = require("mongoose");

const WorkoutHistorySchema = new mongoose.Schema({
  userId: { type: String, required: true },
  workoutName: { type: String, required: true },
  reps: [
    {
      timestamp: { type: Date, required: true },
      reps: { type: Number, required: true },
    },
  ],
  timestamp: { type: Date, required: true }, // time of completion or start
});
const WorkoutHistory = mongoose.models.WorkoutHistory ||
  mongoose.model("WorkoutHistory", WorkoutHistorySchema);
module.export = WorkoutHistory;
