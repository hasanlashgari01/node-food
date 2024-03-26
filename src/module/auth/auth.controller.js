const autoBind = require("auto-bind");
const AuthService = require("./auth.service");
const AuthMessage = require("./auth.messages");
const { CookieNames } = require("../../common/constant/cookie.enum");
const { setRefreshToken, setAccessToken } = require("../../common/utils/auth");

class AuthController {
    #service;

    constructor() {
        autoBind(this);
        this.#service = new AuthService();
    }

    async sendOtp(req, res, next) {
        try {
            const {mobile, email, fullName, password} = req.body;
            await this.#service.sendOtp(mobile, email, fullName, password);

            return res.status(201).json({ message: AuthMessage.SendOtpSuccessfully });
        } catch (error) {
            next(error);
        }
    }

    async checkOtp(req, res, next) {
        try {
            const { payload } = await this.#service.checkOtp(req.body);

            await setAccessToken(res, payload)
            await setRefreshToken(res, payload)

            res.status(201).json({ message: AuthMessage.VerifyOtpSuccessfully });
        } catch (error) {
            next(error);
        }
    }

    async logout(req, res, next) {
        try {
            res.clearCookie(CookieNames.RefreshToken).clearCookie(CookieNames.AccessToken).status(200).json({
                message: "شما از سایت خارج شدید"
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = AuthController;
