const mongoose = require("mongoose");

const horoscopeSchema = new mongoose.Schema({
  sign: { type: String, required: true },
  period: {
    start: { type: String, required: true },
    end: { type: String, required: true }
  },
  image: { type: String, required: true },
  dailyFortune: {
    date: { type: Date, required: true },
    content: { type: String, required: true },
    updatedAt: { type: Date, default: Date.now }
  }
});

module.exports = mongoose.model("Horoscope", horoscopeSchema);