const mongoose = require("mongoose");

const workoutPlanSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    exercises: [{ name: String, sets: Number, reps: Number }], 
});

const WorkoutPlan = mongoose.model("WorkoutPlan", workoutPlanSchema);
module.exports = WorkoutPlan;
