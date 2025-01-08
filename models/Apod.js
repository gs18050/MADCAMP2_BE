// models/Apod.js
const mongoose = require("mongoose");

const apodSchema = new mongoose.Schema({
  date: { type: String, required: true, unique: true },
  explanation: { type: String, required: true },
  title: { type: String, required: true },
  url: { type: String, required: true },
  media_type: { type: String, required: true },
  lastUpdated: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Apod", apodSchema);
