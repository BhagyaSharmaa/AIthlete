const express = require("express");
const router = express.Router();
const Score = require("../models/score");

router.get("/", async (req, res) => {
    try {
        const scores = await Score.find().sort({ score: -1 });
        res.json(scores);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch scores" });
    }
});

router.get("/leaderboard", async (req, res) => {
    try {
        const topScores = await Score.find().sort({ score: -1 }).limit(5);
        res.json(topScores);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch leaderboard" });
    }
});

router.post("/", async (req, res) => {
    try {
        const { username, score } = req.body;
        
        if (!username || score == null) {
            return res.status(400).json({ error: "Username and score are required." });
        }

        const newScore = new Score({ username, score });
        await newScore.save();
        
        res.status(201).json({ 
            message: "Score submitted successfully!", 
            score: newScore 
        });
    } catch (err) {
        res.status(500).json({ error: "Failed to submit score" });
    }
});

module.exports = router;
