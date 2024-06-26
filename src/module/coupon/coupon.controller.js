const autoBind = require("auto-bind");
const CouponService = require("./coupon.service");
const CouponMessage = require("./coupon.messages");

class CouponController {
    #service;

    constructor() {
        autoBind(this);
        this.#service = new CouponService();
    }

    async getByCode(req, res, next) {
        try {
            const { code } = req.params;
            const coupon = await this.#service.getByCode(code);

            res.status(200).json(coupon);
        } catch (error) {
            next(error);
        }
    }

    async create(req, res, next) {
        try {
            const { code } = req.body;
            await this.#service.checkExistCode(code, true);
            await this.#service.create(req.user, req.body);

            res.status(201).json({ message: CouponMessage.CouponCreatedSuccess });
        } catch (error) {
            next(error);
        }
    }

    async getOneById(req, res, next) {
        try {
            const { id } = req.params;
            const result = await this.#service.getOneById(id);

            res.json(result);
        } catch (error) {
            next(error);
        }
    }

    async update(req, res, next) {
        try {
            const { id } = req.params;
            console.log(id);
            await this.#service.update(id, req.body);

            res.json({ message: CouponMessage.CouponUpdatedSuccess });
        } catch (error) {
            next(error);
        }
    }

    async getAll(req, res, next) {
        try {
            const { status } = req.query;
            const coupons = await this.#service.getAll(status);

            res.json({ count: coupons.length, coupons });
        } catch (error) {
            next(error);
        }
    }

    async deleteOne(req, res, next) {
        try {
            await this.#service.deleteOne(req.params);

            res.json({ message: CouponMessage.CouponDeleteSuccess });
        } catch (error) {
            next(error);
        }
    }

    async deleteMany(req, res, next) {
        try {
            await this.#service.deleteMany(req.body);

            res.json({ message: CouponMessage.CouponDeleteSuccess });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = CouponController;
