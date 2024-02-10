import autoBind from "auto-bind";
import { NextFunction, Request, Response } from "express";
import AuthMessage from "./auth.messages";
import AuthService from "./auth.service";

class AuthController {
    #service;

    constructor() {
        autoBind(this);
        this.#service = new AuthService();
    }

    async register(req: Request, res: Response, next: NextFunction) {
        try {
            const { mobile, email } = req.body;
            await this.#service.sendOtp(mobile, email);

            return res.json({
                message: AuthMessage.SendOtpSuccessfully,
            });
        } catch (error) {
            next(error);
        }
    }

    async login(req: Request, res: Response, next: NextFunction) {
        try {
            const { mobile, email } = req.body;

            return res.json({
                message: AuthMessage.SendOtpSuccessfully,
            });
        } catch (error) {
            console.log("🚀 ~ AuthController ~ register ~ error:", error);
            next(error);
        }
    }

    async logout() {}
}

export default new AuthController();
