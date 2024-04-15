const jwt = require("jsonwebtoken");

const accessExpired = 15 * 60 * 1000;
const refreshExpired = 30 * 24 * 60 * 60 * 1000;

const generateAccessToken = (payload) => {
    return jwt.sign(payload, String(process.env.ACCESS_TOKEN_SECRET_KEY), { expiresIn: "15m" });
};

const generateRefreshToken = (payload) => {
    return jwt.sign(payload, String(process.env.REFRESH_TOKEN_SECRET_KEY), { expiresIn: "30d" });
};

const cookieOptions = (isAccessToken = true) => {
    return {
        maxAge: isAccessToken ? accessExpired : refreshExpired,
        httpOnly: true, // The cookie only accessible by the web server
        signed: true, // Indicates if the cookie should be signed
        sameSite: "Lax",
        secure: process.env.NODE_ENV === "development" ? false : true,
        domain: process.env.NODE_ENV === "development" ? "localhost" : "",
    };
};

const setAccessToken = (res, payload) => {
    res.cookie("accessToken", generateAccessToken(payload), cookieOptions());
};

const setRefreshToken = (res, payload) => {
    res.cookie("refreshToken", generateRefreshToken(payload), cookieOptions(false));
};

module.exports = { generateAccessToken, generateRefreshToken, setAccessToken, setRefreshToken };
