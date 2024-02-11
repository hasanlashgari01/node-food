import autoBind from "auto-bind";
import { randomInt } from "crypto";
import createHttpError from "http-errors";
import UserModel, { UserSchemaType } from "../user/user.schema";
import AuthMessage from "./auth.messages";

class AuthService {
    #model;
    #MINUTE: number = 1000 * 60;
    #EXPIRED_TIME: number = this.#MINUTE * 2;
    #MAX_ATTEMPTS: number = 3;
    #ATTEMPTS_EXPIRED_TIME: number = this.#MINUTE * 10;

    constructor() {
        autoBind(this);
        this.#model = UserModel;
    }

    public async sendOtp(mobile: string, email: string) {
        const dbLength = await this.#model.countDocuments();
        const { isUserExist } = await this.checkUserExist(mobile, email);
        if (!isUserExist) {
            const otp = await this.generateOtp();
            const user = await this.#model.create({ mobile, email, otp, role: dbLength ? "USER" : "ADMIN" });
            return user;
        }
        if (isUserExist?.verifiedAccount) throw createHttpError.Conflict(AuthMessage.UserExist);

        const { maxAttempts, maxAttemptsExpiresIn } = await this.isThereAttempt(isUserExist);
        const { code, expiresIn } = await this.generateOtp();
        const otp = { code, expiresIn, maxAttempts, maxAttemptsExpiresIn };
        const user = await this.#model.findOneAndUpdate({ $or: [{ mobile }, { email }] }, { otp }, { new: true });
        return user;
    }

    public async checkOtp(mobile: string, email: string) {
        const { isUserExist } = await this.checkUserExist(mobile, email);

        if (new Date(`${isUserExist.otp.expiresIn}`).getTime() < Date.now())
            throw createHttpError.BadRequest(AuthMessage.OtpCodeExpired);
    }

    public async checkUserExist(mobile: string, email: string) {
        const isUserExist = await this.#model.findOne({ $or: [{ mobile }, { email }] });
        return { isUserExist };
    }

    public async isThereAttempt(user: UserSchemaType) {
        let otp = user?.otp || null;
        let now: number = new Date().getTime();
        const isBannedTimeOver = otp.maxAttemptsExpiresIn < now;

        // if before 10 minute send message
        if (otp.maxAttemptsExpiresIn > now) throw createHttpError.BadRequest(AuthMessage.TryLater);
        // if after 10 minute tried everything reset
        if (otp?.maxAttempts == 0) {
            otp.maxAttempts = this.#MAX_ATTEMPTS;
            return otp;
        }

        if (otp?.maxAttempts > 0) {
            otp.maxAttempts--;
            // if try 3 times more user banned for 10 minutes
            if (otp.maxAttempts == 0 && isBannedTimeOver) {
                otp.maxAttemptsExpiresIn = now + this.#ATTEMPTS_EXPIRED_TIME;
                return otp;
            }

            return otp;
        }
        return createHttpError.BadRequest(AuthMessage.WrongOtp);
    }

    public async generateOtp() {
        let now: number = new Date().getTime();

        const otp = {
            code: randomInt(10000, 99999),
            expiresIn: now + this.#EXPIRED_TIME, // 2 minutes
        };
        return otp;
    }
}

export default AuthService;
