const createHttpError = require("http-errors");
const { isValidObjectId } = require("mongoose");
const CouponModel = require("./coupon.schema");
const CouponMessage = require("./coupon.messages");

class CouponService {
    #model;
    constructor() {
        this.#model = CouponModel;
    }

    async getByCode(code) {
        const result = await this.#model.findOne({ code });
        if (!result) throw createHttpError.NotFound(CouponMessage.NotFound);
        if (result.status === "expired" || result.status === "notActive")
            throw createHttpError.BadRequest(CouponMessage.CouponExpired);
        if (result.usageCount === 0) throw createHttpError.BadRequest(CouponMessage.CouponExpired);
        if (result.userIds.length >= 1) {
            if (!result.userIds.includes(result.creator.toString())) {
                throw createHttpError.BadRequest(CouponMessage.NotValid);
            }
        }
        return result;
    }

    async create(userDto, couponDto) {
        const { _id: userId } = userDto;
        const { code, type, amount, status, startDate, expireDate, usageCount, usageLimit, foodIds, userIds } =
            couponDto;

        const coupon = await this.#model.create({
            code,
            type,
            amount,
            status,
            startDate,
            expireDate,
            usageCount,
            usageLimit,
            creator: userId,
            foodIds,
            userIds,
        });

        if (!coupon) throw createHttpError.InternalServerError(CouponMessage.InternalServerError);
    }

    async getOneById(couponId) {
        await this.checkValidCouponId(couponId);

        const result = await this.#model.findById(couponId);
        if (!result) throw createHttpError.NotFound(CouponMessage.NotFound);

        return result;
    }

    async update(couponId, couponDto) {
        console.log(couponId);
        const { code, type, amount, status, startDate, expireDate, usageCount, usageLimit, foodIds, userIds } =
            couponDto;

        const updateResult = await this.#model.updateOne(
            { _id: couponId },
            { code, type, amount, status, startDate, expireDate, usageCount, usageLimit, foodIds, userIds }
        );
        if (!updateResult.matchedCount) throw createHttpError.NotFound(CouponMessage.CouponUpdatedFailed);
    }

    async getAll(status) {
        if (!status) return await this.#model.find({}).lean();

        return await this.#model.find({ status }).lean();
    }

    async deleteOne(couponDto) {
        const { id: couponId } = couponDto;

        await this.checkValidCouponId(couponId);
        const result = await this.#model.deleteOne({ _id: couponId });
        if (result.deletedCount === 0) throw createHttpError.NotFound(CouponMessage.CouponDeleteFailed);
    }

    async deleteMany(couponDto) {
        const { couponsId } = couponDto;

        const result = await this.#model.deleteMany({ _id: { $in: couponsId } });
        if (result.deletedCount === 0) throw createHttpError.NotFound(CouponMessage.CouponDeleteFailed);
    }

    async checkValidCouponId(couponId) {
        if (!isValidObjectId(couponId)) throw createHttpError.BadRequest(CouponMessage.IdNotValid);
    }

    async checkExistCode(code, showError = false) {
        const coupon = await this.#model.findOne({ code });
        if (showError && coupon) throw createHttpError.Conflict(CouponMessage.AlreadyExist);
        return coupon;
    }

    async checkIsCreator(userDto, couponId) {
        const { _id: userId } = userDto;

        const coupon = await this.#model.findById(couponId);
        if (coupon.creator.toString() !== userId.toString()) throw createHttpError.Forbidden(CouponMessage.NotCreator);
    }
}

module.exports = CouponService;
