const express = require("express");
const axios = require("axios");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const authenticate = require("../middlewares/auth");
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET;

// Route for Google Authentication
router.post("/auth/google", async (req, res) => {
    const { googleToken } = req.body;

    if (!googleToken) {
        return res.status(400).json({ error: "Google token is required." });
    }

    try {
        // Verify Google token
        const googleResponse = await axios.get(`https://oauth2.googleapis.com/tokeninfo?id_token=${googleToken}`);
        const { sub: googleId, email, name } = googleResponse.data;

        if (!googleId || !email || !name) {
            return res.status(400).json({ error: "Invalid Google token data received." });
        }

        // Find or create user
        let user = await User.findOne({ googleId });

        if (!user) {
            user = new User({ googleId, email, name });
            await user.save();
        }

        // Generate JWT
        const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "1h" });

        res.status(200).json({ user: { id: user._id, email: user.email, name: user.name }, token });
    } catch (error) {
        console.error("Google login error:", error.message);
        if (error.response) {
            console.error("Google API error:", error.response.data);
        }
        res.status(500).json({ error: "Failed to process Google login." });
    }
});

// Route to fetch current user's information
router.get("/me", authenticate, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ error: "User not found." });
        }

        res.status(200).json({
            id: user._id,
            email: user.email,
            name: user.name,
        });
    } catch (error) {
        console.error("Failed to fetch user information:", error.message);
        res.status(500).json({ error: "Failed to fetch user information." });
    }
});

module.exports = router;