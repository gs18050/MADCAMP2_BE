require("dotenv").config();
const jwt = require("jsonwebtoken");

// .env에 JWT_SECRET이 설정되어 있어야 함
const payload = {
    id: "63b2df1248b5a5e9bfcdeae3", // MongoDB에서 사용할 테스트 User ID
};

const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1d" });
console.log("Generated JWT Token:", token);