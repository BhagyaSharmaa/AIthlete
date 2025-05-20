const express = require('express');
const router = express.Router();
const WorkoutPlan = require('../models/WorkoutPlan'); // Import the WorkoutPlan model

// Route to fetch workout plans

router.get("/", async (req, res) => {
    try {
        console.log("[INFO] Fetching workout plans...");

        const workoutPlans = await WorkoutPlan.find(); // Query to get all workout plans
        if (!workoutPlans || workoutPlans.length === 0) {
            console.log("[INFO] No workout plans found.");
            return res.status(404).json({ error: "No workout plans found" });
        }

        console.log(`[INFO] ${workoutPlans.length} workout plans fetched.`);
        res.status(200).json(workoutPlans); // Respond with the workout plans
    } catch (error) {
        console.error("[ERROR] Failed to fetch workout plans:", error);
        res.status(500).json({ error: "Failed to fetch workout plans" });
    }
});

module.exports = router;



router.post("/", async (req, res) => {
    try {
        const { _id, title, description, exercises } = req.body;

        const newPlan = new WorkoutPlan({
            _id, 
            title,
            description,
            exercises
        });

        await newPlan.save();
        res.status(201).json(newPlan);
    } catch (err) {
        if (err.code === 11000) {
            return res.status(400).json({ error: "Workout plan with this ID already exists" });
        }
        res.status(500).json({ error: "Failed to create workout plan" });
    }
});

// In your routes file
router.get("/:title", async (req, res) => {
    try {
        const plan = await WorkoutPlan.findOne({ title: req.params.title }); // Use title here
        if (!plan) {
            return res.status(404).json({ error: "Workout plan not found" });
        }
        res.json(plan);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch the workout plan" });
    }
});


module.exports = router;
