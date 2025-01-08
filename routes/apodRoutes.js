// routes/apodRoutes.js
const express = require("express");
const router = express.Router();
const Apod = require("../models/Apod");
const axios = require("axios");

// 이미지 풀 업데이트 함수
async function updateImagePool() {
  try {
    const response = await axios.get(
      `https://api.nasa.gov/planetary/apod?api_key=${process.env.VITE_NASA_API_KEY}&count=50`
    );

    const images = response.data.filter((item) => item.media_type === "image");

    // 기존 이미지 삭제 후 새 이미지로 교체
    await Apod.deleteMany({});
    await Apod.insertMany(images);

    console.log("Image pool updated successfully");
  } catch (error) {
    console.error("Failed to update image pool:", error);
  }
}

// 1시간마다 이미지 풀 업데이트
setInterval(updateImagePool, 3600000);

// 초기 실행
updateImagePool();

// 랜덤 이미지 9개 가져오기
router.get("/random", async (req, res) => {
  try {
    const images = await Apod.aggregate([
      { $match: { media_type: "image" } },
      { $sample: { size: 9 } },
    ]);
    res.json(images);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch random images" });
  }
});

module.exports = router;
