import autoBind from "auto-bind";
import { randomInt } from "crypto";
import createHttpError from "http-errors";
import UserModel, { UserSchemaType } from "../user/user.schema";
import AuthMessage from "./auth.messages";

class AuthService {
    #model;
    #now: number = Date.now();
    #minute: number = 1000 * 60;
    #EXPIRED_TIME: number = this.#now + this.#minute * 2;
    #ATTEMPTS_EXPIRED_TIME: number = this.#now + this.#minute * 10;

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
        if (new Date(otp?.maxAttemptsExpiresIn).getTime() > this.#now)
            throw createHttpError.BadRequest(AuthMessage.TryLater);
        if (otp?.maxAttempts == 0) {
            otp.maxAttemptsExpiresIn = this.#ATTEMPTS_EXPIRED_TIME;
            return otp;
        }
        if (otp?.maxAttempts > 0) {
            otp.maxAttempts--;

            return otp;
        }
        return createHttpError.BadRequest(AuthMessage.WrongOtp);
    }

    public async generateOtp() {
        const otp = {
            code: randomInt(10000, 99999),
            expiresIn: this.#EXPIRED_TIME, // 2 minutes
        };
        return otp;
    }
}

export default AuthService;
