const express = require("express");
const cors = require("cors");
require("dotenv").config();
const dbConnect = require("./lib/dbConnect"); // Import the dbConnect function
const { withAuth } = require("@clerk/clerk-sdk-node"); // Import the Clerk SDK

const MONGO_URI = process.env.MONGO_URI;
const PORT = process.env.PORT || 5000;

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB using dbConnect function
dbConnect(); // Call the dbConnect function here

// Routes
const workoutRoutes = require("./routes/WorkoutRoutes");
const scoreRoutes = require("./routes/scoreRoutes");
const workoutHistoryRoutes = require("./routes/workoutHistoryRoutes");

app.use("/api/workouts", workoutRoutes);
app.use("/api/scores", scoreRoutes);
app.use("/api/history", workoutHistoryRoutes);

// Default route
app.get("/", (req, res) => {
    res.send("Backend is running...");
});

// Sample route to verify Clerk secret key integration (optional, for testing purposes)
app.get("/verify", withAuth(), async (req, res) => {
    try {
        // The user is now authenticated, and their info is available in `req.auth`
        const user = req.auth.user;
        res.json({ message: "User authenticated", user });
    } catch (err) {
        res.status(500).json({ error: "Error verifying user session", details: err });
    }
});

// Start server
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
