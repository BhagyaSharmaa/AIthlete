// lib/dbConnect.js
const mongoose = require("mongoose");

const dbConnect = async () => {
    if (mongoose.connection.readyState >= 1) {
        return; // If already connected, do nothing
    }

    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log("✅ Connected to MongoDB");
    } catch (error) {
        console.error("❌ MongoDB Connection Error:", error);
        throw new Error("MongoDB connection failed");
    }
};

module.exports = dbConnect;
