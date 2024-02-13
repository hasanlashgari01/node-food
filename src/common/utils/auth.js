const jwt = require("jsonwebtoken");

const generateAccessToken = (payload) => {
    return jwt.sign(payload, String(process.env.ACCESS_TOKEN_SECRET_KEY), { expiresIn: "15m" });
};

const generateRefreshToken = (payload) => {
    return jwt.sign(payload, String(process.env.REFRESH_TOKEN_SECRET_KEY), { expiresIn: "30d" });
};

module.exports = { generateAccessToken, generateRefreshToken };
