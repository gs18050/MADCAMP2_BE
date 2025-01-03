const express = require("express");
const Horoscope = require("../models/Horoscope");
const router = express.Router();
require("dotenv").config();
const OpenAI = require('openai');

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY, // .env에 저장된 API 키 사용
});

async function askChatGPT(prompt) {
    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini", // 사용할 모델
            messages: [{ role: "user", content: prompt }], // 사용자 쿼리
        });

        return response.choices[0].message.content; // ChatGPT 응답
    } catch (err) {
        console.error("Error communicating with ChatGPT:", err.message);
        throw err;
    }
}

router.get("/", async (req, res) => {
	try {
		const horoscopes = await Horoscope.find();
		res.status(200).json(horoscopes);
	} catch (err) {
		res.status(500).json({ message: "Failed to fetch horoscopes", error: err.message });
	}
});

router.get("/:sign", async (req, res) => {
	const { sign } = req.params;
  
	try {
	  	const horoscope = await Horoscope.findOne({ sign: sign });
	  	if (!horoscope) {
			return res.status(404).json({ message: "Horoscope not found" });
	  	}

		const prompt = "별자리 "+sign+"의 오늘의 운세 알려줘"
		const answer = await askChatGPT(prompt)
		res.status(200).json({
			sign: horoscope.sign,
			dailyFortune: {
				date: new Date(),
				content: answer,
			},
		});
	} catch (err) {
		console.error("Failed to fetch horoscope for sign:", err.message);
		res.status(500).json({ message: "Failed to fetch horoscope for sign", error: err.message });
	}
});

module.exports = router;