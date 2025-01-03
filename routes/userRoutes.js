const express = require("express");
const User = require("../models/User");
const router = express.Router();

router.post("/", async (req, res) => {
    try {
      	const user = new User(req.body);
    	const savedUser = await user.save();
    	res.status(201).json(savedUser);
  	} catch (err) {
    	res.status(500).json({ error: err.message });
  	}
});

router.get("/", async (req, res) => {
  	try {
    	const users = await User.find();
    	res.json(users);
  	} catch(err) {
    	res.status(500).json({ error: err.message });
  	}
});

module.exports = router;