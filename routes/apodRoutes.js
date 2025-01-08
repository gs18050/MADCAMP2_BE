// // routes/apodRoutes.js
// const express = require("express");
// const router = express.Router();
// const Apod = require("../models/Apod");
// const axios = require("axios");

// // 이미지 풀 업데이트 함수
// async function updateImagePool() {
//   try {
//     const response = await axios.get(
//       `https://api.nasa.gov/planetary/apod?api_key=${process.env.VITE_NASA_API_KEY}&count=30`
//     );

//     const images = response.data.filter((item) => item.media_type === "image");

//     // 기존 이미지 삭제 후 새 이미지로 교체
//     await Apod.deleteMany({});
//     await Apod.insertMany(images);

//     console.log("Image pool updated successfully");
//   } catch (error) {
//     console.error("Failed to update image pool:", error);
//   }
// }

// // 1시간마다 이미지 풀 업데이트
// setInterval(updateImagePool, 3600000);

// // 초기 실행
// updateImagePool();

// // 랜덤 이미지 9개 가져오기
// router.get("/random", async (req, res) => {
//   try {
//     const images = await Apod.aggregate([
//       { $match: { media_type: "image" } },
//       { $sample: { size: 9 } },
//     ]);
//     res.json(images);
//   } catch (error) {
//     res.status(500).json({ error: "Failed to fetch random images" });
//   }
// });

// module.exports = router;
// routes/apodRoutes.js
const express = require("express");
const router = express.Router();
const Apod = require("../models/Apod");
const axios = require("axios");

// routes/apodRoutes.js
async function updateImagePool() {
  try {
    console.log("Starting image pool update...");

    const response = await axios.get(
      `https://api.nasa.gov/planetary/apod?api_key=${process.env.VITE_NASA_API_KEY}&count=30`
    );

    console.log(`Received ${response.data.length} images from NASA API`);

    const images = response.data.filter((item) => item.media_type === "image");
    console.log(`Filtered ${images.length} valid images`);

    // 기존 이미지 삭제 후 새 이미지로 교체
    await Apod.deleteMany({});
    console.log("Cleared existing images");

    const inserted = await Apod.insertMany(images);
    console.log(`Successfully inserted ${inserted.length} images`);
  } catch (error) {
    console.error("Failed to update image pool:", error.message);
    if (error.response) {
      console.error("NASA API Response:", error.response.data);
    }
  }
}

// 랜덤 이미지 9개 가져오기
router.get("/random", async (req, res) => {
  try {
    const totalImages = await Apod.countDocuments();
    console.log(`Total images in database: ${totalImages}`);

    if (totalImages === 0) {
      console.log("No images found, triggering update...");
      await updateImagePool();
    }

    const images = await Apod.aggregate([
      { $match: { media_type: "image" } },
      { $sample: { size: 9 } },
    ]);

    console.log(`Returning ${images.length} random images`);
    res.json(images);
  } catch (error) {
    console.error("Error in /random endpoint:", error);
    res.status(500).json({ error: "Failed to fetch random images" });
  }
});
