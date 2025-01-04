require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");

const userRoutes = require("./routes/userRoutes");
const bucketListRoutes = require("./routes/bucketListRoutes");
const horoscopeRoutes = require("./routes/horoscopeRoutes");

const app = express();
const port = process.env.PORT || 3000;
const uri = process.env.DB_URL;

app.use(cors());
app.use(bodyParser.json());

// Routes
app.use("/api/users", userRoutes);
app.use("/api/buckets", bucketListRoutes);
app.use("/api/horoscopes", horoscopeRoutes);

// MongoDB 연결
async function connectToDB() {
    try {
        await mongoose.connect(process.env.DB_URL);
        console.log("MongoDB Connected");
    } catch(err) {
        console.error("MongoDB connection failed:", err.message);
        process.exit(1)
    }
};

// 서버 실행
app.listen(port, '0.0.0.0', async () => {
    console.log(`Server running on port: ${port}`);
	await connectToDB();
});