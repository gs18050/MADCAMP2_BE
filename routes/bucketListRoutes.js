const express = require("express");
const BucketList = require("../models/BucketList");
const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const bucket = new BucketList(req.body);
    const savedBucket = await bucket.save();
    res.status(201).json(savedBucket);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/", async (req, res) => {
  try {
    const buckets = await BucketList.find().populate("userId");
    res.json(buckets);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;