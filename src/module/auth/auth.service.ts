import autoBind from "auto-bind";
import { randomInt } from "crypto";
import createHttpError from "http-errors";
import BanUserModel, { BanUserSchemaType } from "../user/ban.schema";
import UserModel, { UserSchemaType } from "../user/user.schema";
import AuthMessage from "./auth.messages";

class AuthService {
    #model;
    #banModel;
    #MINUTE: number = 1000 * 60;
    #EXPIRED_TIME: number = this.#MINUTE * 2;
    #MAX_ATTEMPTS: number = 3;
    #ATTEMPTS_EXPIRED_TIME: number = this.#MINUTE * 10;

    constructor() {
        autoBind(this);
        this.#model = UserModel;
        this.#banModel = BanUserModel;
    }

    public async sendOtp(mobile: string, email: string) {
        const dbLength = await this.#model.countDocuments();
        const user = await this.checkUserExist(mobile, email);
        if (!user) {
            const otp = await this.generateOtp();
            const user = await this.#model.create({ mobile, email, otp, role: dbLength ? "USER" : "ADMIN" });
            return user;
        }
        // if (user?.verifiedAccount) throw createHttpError.Conflict(AuthMessage.UserExist);
        await this.isThereAttempt(user, false);
        const { code, expiresIn } = await this.generateOtp();
        const otp = { code, expiresIn };
        await this.#model.findOneAndUpdate({ $or: [{ mobile }, { email }] }, { otp }, { new: true });

        return user;
    }

    public async checkOtp(mobile: string, email: string, code: string) {
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

        return user;
    }

    public async checkUserExist(mobile: string, email: string) {
        const isUserExist: UserSchemaType | null = await this.#model.findOne({ $or: [{ mobile }, { email }] });
        const isBanExist: BanUserSchemaType | null = await this.#banModel.findOne({ $or: [{ mobile }, { email }] });
        if (isBanExist) throw createHttpError.Forbidden(AuthMessage.BanUser);

        return isUserExist;
    }

    public async isThereAttempt(user: UserSchemaType, turnOnDecrement: boolean) {
        let otp = user?.otp || null;
        let now: number = new Date().getTime();

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
