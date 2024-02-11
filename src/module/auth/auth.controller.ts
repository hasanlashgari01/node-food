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

    async sendOtp(req: Request, res: Response, next: NextFunction) {
        try {
            const { mobile, email } = req.body;
            await this.#service.sendOtp(mobile, email);

            return res.status(201).json({ message: AuthMessage.SendOtpSuccessfully });
        } catch (error) {
            next(error);
        }
    }

    async checkOtp(req: Request, res: Response, next: NextFunction) {
        try {
            const { mobile, email, code } = req.body;
            await this.#service.checkOtp(mobile, email, code);

            return res.status(201).json({ message: AuthMessage.VerifyOtpSuccessfully });
        } catch (error) {
            next(error);
        }
    }

    async logout() {}
}

export default new AuthController();
