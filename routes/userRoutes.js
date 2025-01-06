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

router.post("/me/sendRequest", authenticate, async (req, res) => {
    const { targetEmail } = req.body;

    if (!targetEmail) {
        return res.status(400).json({ message: "Target email is required." });
    }

    try {
        const targetUser = await User.findOne({ email: targetEmail });
        if (!targetUser) {
            return res.status(404).json({ message: "User not found." });
        }

        // 이미 친구거나 요청이 존재하는지 확인
        if (
            targetUser.friends.some((friend) => friend.friend_email === req.user.email) ||
            targetUser.requests.some((request) => request.request_email === req.user.email)
        ) {
            return res.status(400).json({ message: "Request already sent or user is already a friend." });
        }

        targetUser.requests.push({
            request_email: req.user.email,
            request_name: req.user.name,
        });
        await targetUser.save();

        res.status(200).json({ message: "Friend request sent." });
    } catch (err) {
        res.status(500).json({ message: "Failed to send friend request.", error: err.message });
    }
});

router.post("/me/addFriend", authenticate, async (req, res) => {
    const { requesterEmail } = req.body;

    if (!requesterEmail) {
        return res.status(400).json({ message: "Requester email is required." });
    }

    try {
        const requester = await User.findOne({ email: requesterEmail });
        if (!requester) {
            return res.status(404).json({ message: "Requester not found." });
        }

        const currentUser = await User.findById(req.user.id);

        // 요청 존재 여부 확인
        const requestIndex = currentUser.requests.findIndex(
            (request) => request.request_email === requesterEmail
        );

        if (requestIndex === -1) {
            return res.status(400).json({ message: "No friend request from this user." });
        }

        // 요청 삭제 및 친구 추가
        currentUser.requests.splice(requestIndex, 1);
        currentUser.friends.push({
            friend_email: requester.email,
            friend_name: requester.name,
        });
        await currentUser.save();

        // 상대방 친구 목록에도 추가
        requester.friends.push({
            friend_email: currentUser.email,
            friend_name: currentUser.name,
        });
        await requester.save();

        res.status(200).json({ message: "Friend added successfully." });
    } catch (err) {
        res.status(500).json({ message: "Failed to add friend.", error: err.message });
    }
});

router.get("/me/friends", authenticate, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("friends");
        res.status(200).json(user.friends);
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch friends.", error: err.message });
    }
});

router.get("/me/requests", authenticate, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("requests");
        res.status(200).json(user.requests);
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch requests.", error: err.message });
    }
});

module.exports = router;