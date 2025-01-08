const express = require("express");
const axios = require("axios");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const authenticate = require("../middlewares/auth");
const router = express.Router();
const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client(process.env.GOOGLE_ID);

const JWT_SECRET = process.env.JWT_SECRET;

// Route for Google Authentication
router.post("/auth/google", async (req, res) => {
    const { googleToken } = req.body;

    if (!googleToken) {
        return res.status(400).json({ error: "Google token is required." });
    }

    try {
        const ticket = await client.verifyIdToken({
            idToken: googleToken,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const { sub: googleId, email, name } = ticket.getPayload();

        let user = await User.findOne({ googleId });
        if (!user) {
            user = new User({ googleId, email, name });
            await user.save();
        }

        const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "1h" });
        res.status(200).json({ user: { id: user._id, email, name }, token });
    } catch (error) {
        console.error("Google login error:", error.message);
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
        console.log("Sending request to "+targetEmail)

        const user = await User.findById(req.user.id);
        const targetUser = await User.findOne({ email: targetEmail });
        if (!targetUser) {
            return res.status(404).json({ message: "User not found." });
        }

        // 이미 친구거나 요청이 존재하는지 확인
        if (
            targetUser.friends.some((friend) => friend.friend_email === user.email) ||
            targetUser.requests.some((request) => request.request_email === user.email)
        ) {
            return res.status(400).json({ message: "Request already sent or user is already a friend." });
        }
        console.log("Making request", user.email, user.name, targetUser.email, targetUser.name)
        targetUser.requests.push({
            request_email: user.email,
            request_name: user.name,
        });

        try {
            await targetUser.save();
            console.log("Request saved successfully");
        } catch (saveError) {
            console.error("Error saving target user:", saveError);
            return res.status(500).json({ message: "Failed to save friend request.", error: saveError.message });
        }

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

router.post("/me/deleteFriend", authenticate, async (req, res) => {
    const { friendEmail } = req.body;

    if (!friendEmail) {
        return res.status(400).json({ message: "Friend email is required." });
    }

    try {
        // Find the friend by email
        const friend = await User.findOne({ email: friendEmail });
        if (!friend) {
            return res.status(404).json({ message: "Friend not found." });
        }

        // Find the current user
        const currentUser = await User.findById(req.user.id);

        // Check if the friend exists in the current user's friend list
        const currentUserFriendIndex = currentUser.friends.findIndex(
            (bud) => bud.friend_email === friendEmail
        );

        if (currentUserFriendIndex === -1) {
            return res.status(400).json({ message: "Not a friend." });
        }

        // Remove friend from current user's list
        currentUser.friends.splice(currentUserFriendIndex, 1);
        await currentUser.save();

        // Remove current user from the friend's friend list
        const friendIndex = friend.friends.findIndex(
            (bud) => bud.friend_email === currentUser.email
        );

        if (friendIndex !== -1) {
            friend.friends.splice(friendIndex, 1);
            await friend.save();
        }

        res.status(200).json({ message: "Friend deleted successfully from both lists." });
    } catch (err) {
        console.error("Error deleting friend:", err.message);
        res.status(500).json({ message: "Failed to delete friend.", error: err.message });
    }
});


router.post("/me/refuse", authenticate, async (req, res) => {
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
        await currentUser.save();

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