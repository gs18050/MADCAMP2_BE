const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
	googleId: { type: String, required: true },
	email: { type: String, required: true, unique: true },
	name: { type: String, required: true },
	createdAt: { type: Date, default: Date.now },
	friends: { type: [{
		friend_email: { type: String, required: true },
		friend_name: { type: String, required: true }
	}], default: [] },
	requests: { type: [{
		request_email: { type: String, required: true },
		request_name: { type: String, required: true }
	}], default: [] }
});

module.exports = mongoose.model("User", userSchema);