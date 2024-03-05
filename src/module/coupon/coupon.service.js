const createHttpError = require("http-errors");
const { isValidObjectId } = require("mongoose");
const CouponModel = require("./coupon.schema");
const CouponMessage = require("./coupon.messages");

class CouponService {
    #model;
    constructor() {
        this.#model = CouponModel;
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

    async update(couponId, couponDto) {
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
