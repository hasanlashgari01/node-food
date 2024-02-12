import dotenv from "dotenv";
import { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import jwt, { JwtPayload } from "jsonwebtoken";
import UserModel from "../../module/user/user.schema";
import AuthorizationMessage from "../messages/auth.message";

dotenv.config();

const AccessTokenGuard = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req?.cookies?.accessToken;
        if (!token) throw createHttpError.Unauthorized(AuthorizationMessage.Login);

        const decoded: JwtPayload | string = jwt.verify(token, String(process.env.ACCESS_TOKEN_SECRET_KEY));
        if (typeof decoded === "object" && "_id" in decoded) {
            const user = await UserModel.findById(decoded?._id, { accessToken: 0, otp: 0, verifiedAccount: 0 }).lean();
            if (!user) throw createHttpError.Unauthorized(AuthorizationMessage.Login);

            req.user = user;
            return next();
        }
        throw createHttpError.Unauthorized(AuthorizationMessage.InvalidToken);
    } catch (error) {
        next(error);
    }
};

export default AccessTokenGuard;
