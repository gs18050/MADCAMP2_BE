const mongoose = require("mongoose");

const bucketListSchema = new mongoose.Schema({
	userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
	content: { type: String, required: true },
	modelPath: { type: String, required: true },
	position: {
		x: { type: Number, required: true },
		y: { type: Number, required: true },
		z: { type: Number, required: true }
	},
	isCompleted: { type: Boolean, default: false },
	completedAt: { type: Date },
	createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("BucketList", bucketListSchema);