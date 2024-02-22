const autoBind = require("auto-bind");
const createHttpError = require("http-errors");
const BanUserModel = require("../ban/ban.schema");
const UserModel = require("../user/user.schema");
const AuthMessage = require("./auth.messages");
const { randomInt } = require("crypto");
const { generateAccessToken, generateRefreshToken, hashPassword } = require("../../common/utils/auth");
const bcrypt = require("bcrypt");
const { valid } = require("joi");

class AuthService {
    #model;
    #banModel;
    #MINUTE = 1000 * 60;
    #EXPIRED_TIME = this.#MINUTE * 2;
    #MAX_ATTEMPTS = 3;
    #ATTEMPTS_EXPIRED_TIME = this.#MINUTE * 10;

    constructor() {
        autoBind(this);
        this.#model = UserModel;
        this.#banModel = BanUserModel;
    }

    async sendOtp(mobile, email, fullName, password) {
        const user = await this.checkUserExist(mobile, email);
        let validParam = mobile ? { mobile } : { email };
        if (!user) {
            const dbLength = await this.#model.find().count();
            const otp = await this.generateOtp();
            const salt = bcrypt.genSaltSync(10);
            const hashedPassword = bcrypt.hashSync(password, salt);
            await this.#model.create({
                mobile: mobile || null,
                email: email || null,
                fullName,
                otp,
                role: dbLength ? "USER" : "ADMIN",
                password: hashedPassword
            });
            throw new createHttpError.Created(AuthMessage.SendOtpSuccessfully);
        }
        await this.isThereAttempt(user, false);
        const { code, expiresIn } = await this.generateOtp();
        const otp = { code, expiresIn };
        await this.#model.findOneAndUpdate({ ...validParam }, { otp }, { new: true });

        return user;
    }

    async checkOtp({ mobile, email, code }) {
        let now = new Date().getTime();
        const user = await this.checkUserExist(mobile, email);
        if (!user) throw createHttpError.NotFound(AuthMessage.NotFound);
        // if code does not match => attempt - 1 and throw error
        if (user?.otp?.code !== code) {
            const otp = await this.isThereAttempt(user, true);
            await this.#model.findOneAndUpdate({ $or: [{ mobile }, { email }] }, { otp }, { new: true });
            throw createHttpError.BadRequest(AuthMessage.WrongOtp);
        }
        // if code expired throw error
        if (user?.otp?.expiresIn < now) throw createHttpError.BadRequest(AuthMessage.OtpCodeExpired);
        // if code matched but used before throw error
        if (user?.otp?.isActive) throw createHttpError.BadRequest(AuthMessage.OtpCodeUsed);

        user.verifiedAccount = true;
        user.otp.isActive = true;
        await user.save();
        const payload = { _id: user?._id, mobile: user.mobile, email: user.email };
        const accessToken = generateAccessToken(payload);
        const refreshToken = generateRefreshToken(payload);

        return { accessToken, refreshToken };
    }

    async checkUserExist(mobile, email) {
        let validParam = mobile ? { mobile } : { email };
        const isUserExist = await this.#model.findOne({ ...validParam });
        const isBanExist = await this.#banModel.findOne({ mobile, email });
        if (isBanExist) throw createHttpError.Forbidden(AuthMessage.BanUser);

        return isUserExist;
    }

    async isThereAttempt(user, turnOnDecrement) {
        let otp = user?.otp || null;
        let now = new Date().getTime();

        // if before 10 minute send message
        if (otp.maxAttemptsExpiresIn > now) throw createHttpError.BadRequest(AuthMessage.TryLater);
        // if after 10 minute tried everything reset
        if (otp?.maxAttempts == 0 && turnOnDecrement) {
            otp.maxAttempts = this.#MAX_ATTEMPTS;
            return otp;
        }

        if (otp?.maxAttempts > 0 && turnOnDecrement) {
            otp.maxAttempts--;
            // if try 3 times more user banned for 10 minutes
            if (otp.maxAttempts == 0 && otp.maxAttemptsExpiresIn < now) {
                otp.maxAttemptsExpiresIn = now + this.#ATTEMPTS_EXPIRED_TIME;
                return otp;
            }

            return otp;
        }
    }

    async generateOtp() {
        let now = new Date().getTime();

        const otp = {
            code: randomInt(10000, 99999),
            expiresIn: now + this.#EXPIRED_TIME // 2 minutes
        };
        return otp;
    }
}

module.exports = AuthService;
