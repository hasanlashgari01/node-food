const autoBind = require("auto-bind");
const AuthService = require("./auth.service");
const AuthMessage = require("./auth.messages");

class AuthController {
    #service;

    constructor() {
        autoBind(this);
        this.#service = new AuthService();
    }

    async sendOtp(req, res, next) {
        try {
            const { mobile, email } = req.body;
            await this.#service.sendOtp(mobile, email);

            return res.status(201).json({ message: AuthMessage.SendOtpSuccessfully });
        } catch (error) {
            next(error);
        }
    }

    async checkOtp(req, res, next) {
        try {
            const { mobile, email, code } = req.body;
            const { accessToken, refreshToken } = await this.#service.checkOtp(mobile, email, code);

            return res
                .cookie("accessToken", accessToken, { httpOnly: true, secure: true })
                .cookie("refreshToken", refreshToken, { httpOnly: true, secure: true })
                .status(201)
                .json({ message: AuthMessage.VerifyOtpSuccessfully });
        } catch (error) {
            next(error);
        }
    }

    async logout() {}
}

module.exports = AuthController;
