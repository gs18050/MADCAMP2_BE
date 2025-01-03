const express = require("express");
const Horoscope = require("../models/Horoscope");
const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const horoscope = new Horoscope(req.body);
    const savedHoroscope = await horoscope.save();
    res.status(201).json(savedHoroscope);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/", async (req, res) => {
  try {
    const horoscopes = await Horoscope.find();
    res.json(horoscopes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;