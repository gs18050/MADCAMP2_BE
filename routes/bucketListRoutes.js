const express = require("express");
const User = require("../models/User");
const BucketList = require("../models/BucketList");
const authenticate = require("../middlewares/auth");
const router = express.Router();

router.post("/", authenticate, async (req, res) => {
	const { content, targetDate, planet, position } = req.body

	try {
		if (!content || !targetDate || !planet || !position) {
			return res.status(400).json({message: "Requirements not statisfied"});
		}

		const user = await User.findById(req.user.id);
		
		const bucket = new BucketList({
			userId: user._id,
			content,
			targetDate,
			planet,
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
		const filter = { userId: req.user._id }
		if (completed !== undefined) {
			filter.isCompleted = completed == "true";
		}

		const buckets = await BucketList.find().populate("userId");
		res.json(buckets);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

router.patch("/:id/complete", authenticate, async (req, res) => {
	try {
		const { id } = req.params;

		const bucket = await BucketList.findOne({ _id: id, userId: req.user._id });
		if (!bucket) {
			return res.status(404).json({ message: "Bucket not found" });
		}

		bucket.isCompleted = !bucket.isCompleted;
		bucket.completedAt = bucket.isCompleted ? new Date() : null;

		const updatedBucket = await bucket.save();
		res.status(200).json(updatedBucket);
	} catch (err) {
		res.status(500).json({ message: "Failed to update bucket", error: err.message });
	}
});

module.exports = router;