const autoBind = require("auto-bind");
const CouponService = require("./coupon.service");
const CouponMessage = require("./coupon.messages");

class CouponController {
    #service;

    constructor() {
        autoBind(this);
        this.#service = new CouponService();
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

    async update(req, res, next) {
        try {
            const { id } = req.params;
            await this.#service.checkIsCreator(req.user, id);
            await this.#service.update(id, req.body);

            res.json({ message: CouponMessage.CouponUpdatedSuccess });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = CouponController;
