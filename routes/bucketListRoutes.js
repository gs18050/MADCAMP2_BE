const express = require("express");
const User = require("../models/User");
const BucketList = require("../models/BucketList");
const authenticate = require("../middlewares/auth");
const router = express.Router();

router.post("/", authenticate, async (req, res) => {
	const { content, modelPath, position } = req.body

	try {
		console.log(content)
		if (!content || !modelPath || !position) {
			return res.status(400).json({message: "Requirements not statisfied"});
		}
		//console.log(req.user.id)
		
		const bucket = new BucketList({
			userId: req.user.id,
			content,
			modelPath,
			position
		})

		const savedBucket = await bucket.save();
		res.status(201).json(savedBucket);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

router.get("/", authenticate, async (req, res) => {
	try {
		const { completed } = req.query;
		const filter = { userId: req.user.id }

		if (completed !== undefined) {
			filter.isCompleted = completed == "true";
		}

		const buckets = await BucketList.find(filter).populate("userId");
		res.json(buckets);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

router.get("/friend", authenticate, async (req, res) => {
	const { friendEmail } = req.query;

    if (!friendEmail) {
        return res.status(400).json({ message: "Friend email is required." });
    }

    try {
        // 친구 정보 가져오기
		console.log("Friend email: "+friendEmail)
		const user = await User.findById(req.user.id);
        const friend = await User.findOne({ email: friendEmail });

        if (!friend) {
            return res.status(404).json({ message: "Friend not found." });
        }
		
		console.log("Current user: "+user.email)
        // 현재 사용자의 친구 목록에서 확인
        const isFriend = user.friends.some(
            (friendEntry) => friendEntry.friend_email === friend.email
        );

        if (!isFriend) {
            return res.status(403).json({ message: "The user is not your friend." });
        }

        // 친구의 버킷리스트 가져오기
        const friendBuckets = await BucketList.find({ userId: friend._id });

        res.status(200).json(friendBuckets);
    } catch (err) {
        console.error("Failed to fetch friend's bucket list:", err.message);
        res.status(500).json({ message: "Failed to fetch friend's bucket list.", error: err.message });
    }
});

router.patch("/:id/complete", authenticate, async (req, res) => {
	try {
		const { id } = req.params;

		const bucket = await BucketList.findOne({ _id: id, userId: req.user.id });
		if (!bucket) {
			return res.status(404).json({ message: "Bucket not found" });
		}

		if (!bucket.isCompleted) {
			bucket.isCompleted = !bucket.isCompleted;
			bucket.completedAt = bucket.isCompleted ? new Date() : null;
		}

		const updatedBucket = await bucket.save();
		res.status(200).json(updatedBucket);
	} catch (err) {
		res.status(500).json({ message: "Failed to update bucket", error: err.message });
	}
});

router.delete("/:id/delete", authenticate, async (req, res) => {
	try {
        const { id } = req.params;

		console.log('Deleting '+id)

        // 삭제할 버킷리스트 항목 찾기
        const bucket = await BucketList.findOne({ _id: id, userId: req.user.id });
        if (!bucket) {
            return res.status(404).json({ message: "Bucket not found or unauthorized access." });
        }

        // 삭제
        await BucketList.deleteOne({ _id: id });
        res.status(200).json({ message: "Bucket successfully deleted." });
    } catch (err) {
        console.error("Failed to delete bucket:", err.message);
        res.status(500).json({ message: "Failed to delete bucket.", error: err.message });
    }
})

module.exports = router;