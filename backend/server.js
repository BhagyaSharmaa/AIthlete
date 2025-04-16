const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const MONGO_URI = process.env.MONGO_URI;
const app = express();
const PORT = process.env.PORT || 5000;
app.use(cors());

mongoose.connect(MONGO_URI)
    .then(() => console.log("✅ Connected to MongoDB"))
    .catch(err => console.error("❌ MongoDB Connection Error:", err));

app.use(express.json());

const workoutRoutes = require("./routes/WorkoutRoutes");
app.use("/api/workouts", workoutRoutes);

const scoreRoutes = require("./routes/scoreRoutes");
app.use("/api/scores", scoreRoutes);

app.get("/", (req, res) => {
  res.send("Backend is running...");
});

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
