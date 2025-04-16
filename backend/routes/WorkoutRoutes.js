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
        const { title, description, exercises } = req.body;
        const newPlan = new WorkoutPlan({ title, description, exercises });
        await newPlan.save();
        res.status(201).json(newPlan);
    } catch (err) {
        res.status(500).json({ error: "Failed to create workout plan" });
    }
});

module.exports = router;
