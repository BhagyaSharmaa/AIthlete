const express = require("express");
const router = express.Router();
const WorkoutPlan = require("../models/WorkOutPlan");


router.get("/", async (req, res) => {
    try {
        const plans = await WorkoutPlan.find();
        res.json(plans);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch workout plans" });
    }
});


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
