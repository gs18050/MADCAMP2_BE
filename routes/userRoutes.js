const express = require("express");
const axios = require("axios");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
const User = require("../models/User");
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET;

const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Unauthorized." });
    }

    const token = authHeader.split(" ")[1];
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded; // Attach user info to request
        next();
    } catch (error) {
        return res.status(401).json({ error: "Invalid token." });
    }
};

router.post("/auth/google", async (req, res) => {
    const { googleToken } = req.body;
	console.log(googleToken)

    if (!googleToken) {
        return res.status(400).json({ error: "Google token is required." });
    }

    try {
        // Verify Google token and fetch user info
        const googleResponse = await axios.get(`https://oauth2.googleapis.com/tokeninfo?id_token=${googleToken}`);
        const { sub: googleId, email, name } = googleResponse.data;

        if (!googleId || !email || !name) {
            return res.status(400).json({ error: "Invalid Google token." });
        }

        // Check if the user exists in the database
        let user = await User.findOne({ googleId });

        if (!user) {
            // Create a new user if not found
            user = new User({ googleId, email, name });
            await user.save();
        }

        // Generate JWT
        const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "1h" });

        res.status(200).json({ user, token });
    } catch (error) {
        console.error("Google login error:", error.message);
        res.status(500).json({ error: "Failed to process Google login." });
    }
});

router.get("/me", authenticate, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ error: "User not found." });
        }

        res.status(200).json(user);
    } catch (error) {
        console.error("Failed to fetch user:", error.message);
        res.status(500).json({ error: "Failed to fetch user information." });
    }
});

module.exports = router;