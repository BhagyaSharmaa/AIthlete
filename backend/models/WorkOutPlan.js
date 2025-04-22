const mongoose = require("mongoose");

const workoutPlanSchema = new mongoose.Schema({
    _id: { type: String },
    title: { type: String, required: true },
    description: { type: String, required: true },
    exercises: [{
        name: String,
        sets: Number,
        reps: Number,
        _id: false 
    }],
});

const WorkoutPlan = mongoose.model("WorkoutPlan", workoutPlanSchema);
module.exports = WorkoutPlan;

