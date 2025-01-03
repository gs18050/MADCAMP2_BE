const express = require("express");
const Gallery = require("../models/Gallery");
const router = express.Router();

router.post("/", async (req, res) => {
	try {
		const gallery = new Gallery(req.body);
		const savedGallery = await gallery.save();
		res.status(201).json(savedGallery);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

router.get("/", async (req, res) => {
	try {
		const galleries = await Gallery.find();
		res.json(galleries);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

module.exports = router;