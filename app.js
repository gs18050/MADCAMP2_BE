require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const axios = require("axios");
const jwt = require("jsonwebtoken");
const User = require("./models/User");

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

app.get("/auth/callback", async (req, res) => {
    const { code } = req.query;

    if (!code) {
        return res.status(400).json({ error: "Authorization code is missing" });
    }

    try {
        // Authorization Code를 사용하여 Google 토큰 요청
        const tokenResponse = await axios.post("https://oauth2.googleapis.com/token", {
            code,
            client_id: process.env.GOOGLE_ID,
            client_secret: process.env.GOOGLE_PW,
            redirect_uri: process.env.GOOGLE_REDIRECT_URI,
            grant_type: "authorization_code",
        });

        const { id_token, access_token } = tokenResponse.data;

        // ID 토큰 디코드
        const decodedToken = jwt.decode(id_token);
        const { sub: googleId, email, name } = decodedToken;

        //console.log(email)

        if (!googleId || !email || !name) {
            return res.status(400).json({ error: "Invalid Google token data" });
        }

        // 유저를 DB에서 찾거나 새로 생성
        let user = await User.findOne({ googleId });

        if (!user) {
            user = new User({ googleId, email, name });
            await user.save();
        }

        // JWT 생성
        const userToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

        // 프론트엔드로 리다이렉트
        res.redirect(`${process.env.FRONTEND_URL}?token=${userToken}`);
    } catch (error) {
        console.error("Error exchanging authorization code for tokens:", error.message);
        res.status(500).json({ error: "Failed to process Google OAuth callback" });
    }
});

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