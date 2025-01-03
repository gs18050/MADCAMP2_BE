/*const jwt = require("jsonwebtoken");
const User = require("../models/User");

const authenticate = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Authorization token missing or invalid" });
    }

    const token = authHeader.split(" ")[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);

        if (!user) {
            return res.status(401).json({ message: "Invalid token" });
        }

        req.user = user;
        next();
    } catch (err) {
        res.status(401).json({ message: "Invalid token" });
    }
};

module.exports = authenticate;*/

const User = require("../models/User");

const authenticate = async (req, res, next) => {
  // 임시 사용자 정보 추가 (Google 로그인 구현 전 테스트용)
  req.user = {
    _id: "63b2df1248b5a5e9bfcdeae3", // 테스트용 MongoDB User ID
  };
  next();
};

module.exports = authenticate;
