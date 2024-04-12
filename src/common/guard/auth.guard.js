const jwt = require("jsonwebtoken");
const createHttpError = require("http-errors");
const UserModel = require("../../module/user/user.schema");
const AuthorizationMessage = require("../messages/auth.message");
const { generateAccessToken } = require("../utils/auth");
require("dotenv").config();

const AccessTokenGuard = async (req, res, next) => {
    try {
        const refreshToken = req?.cookies?.refreshToken;
        if (!refreshToken) throw createHttpError.Unauthorized(AuthorizationMessage.Login);
        const accessToken = req?.cookies?.accessToken;
        if (!accessToken) return next();

        const decoded = jwt.verify(accessToken, String(process.env.ACCESS_TOKEN_SECRET_KEY));
        if (typeof decoded === "object") {
            const user = await UserModel.findById(decoded?._id)
                .select("-otp -accessToken -password -verifiedAccount -__v")
                .lean();

            req.user = user;
        }
        return next();
    } catch (error) {
        if (error?.name === "TokenExpiredError") return next();
        next(error);
    }
};

const RefreshTokenGuard = async (req, res, next) => {
    try {
        const token = req?.cookies?.refreshToken;
        if (!token) throw createHttpError.Unauthorized(AuthorizationMessage.Login);

        const decoded = jwt.verify(token, String(process.env.REFRESH_TOKEN_SECRET_KEY));
        if (typeof decoded === "object") {
            const user = await UserModel.findById(decoded?._id)
                .select("-otp -accessToken -password -verifiedAccount -__v")
                .lean();
            if (!user) throw createHttpError.Unauthorized(AuthorizationMessage.Login);

            const payload = { _id: user?._id, mobile: user.mobile, email: user.email };
            const accessToken = generateAccessToken(payload);
            res.cookie("accessToken", accessToken, { httpOnly: true, secure: true }).status(201);

            req.user = user;
            return next();
        }
        throw new createHttpError.Unauthorized(AuthorizationMessage.InvalidToken);
    } catch (error) {
        if (error?.name === "TokenExpiredError")
            return next(createHttpError.Unauthorized(AuthorizationMessage.ExpiredToken));
        next(error);
    }
};

const PublicGuard = async (req, res, next) => {
    try {
        const token = req?.cookies?.refreshToken;
        if (!token) return next();

        const decoded = jwt.verify(token, String(process.env.REFRESH_TOKEN_SECRET_KEY));

        if (typeof decoded === "object") {
            const user = await UserModel.findById(decoded?._id)
                .select("-otp -accessToken -password -verifiedAccount -__v")
                .lean();

            const payload = { _id: user?._id, mobile: user.mobile, email: user.email };
            const accessToken = generateAccessToken(payload);
            res.cookie("accessToken", accessToken, { httpOnly: true, secure: true }).status(201);

            req.user = user;
            return next();
        }
    } catch (error) {
        if (error?.name === "TokenExpiredError") return next();
        next(error);
    }
};

module.exports = { AccessTokenGuard, RefreshTokenGuard, PublicGuard };
