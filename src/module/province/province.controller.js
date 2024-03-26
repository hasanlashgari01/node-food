const autoBind = require("auto-bind");
const ProvinceService = require("./province.service");
const ProvinceMessage = require("./province.messages");
const { findUniqueField } = require("../../common/utils/func");

class ProvinceController {
    #service;

    constructor() {
        autoBind(this);
        this.#service = new ProvinceService();
    }

    async getAll(req, res, next) {
        try {
            const provinces = await this.#service.getAll();

            res.json({ count: provinces.length, provinces });
        } catch (error) {
            next(error);
        }
    }

    async create(req, res, next) {
        try {
            await this.#service.create(req.body);

            res.status(201).json({ message: ProvinceMessage.CreatedSuccess });
        } catch (error) {
            next(error);
        }
    }

    async createMany(req, res, next) {
        try {
            await this.#service.createMany(req.body);

            res.status(201).json({ message: ProvinceMessage.CreatedSuccess });
        } catch (error) {
            if (error.code === 11000) {
                return res
                    .status(409)
                    .json({ message: `${findUniqueField(error.message)} در لیست استان ها وجود دارد` });
            }

            next(error);
        }
    }

    async getOne(req, res, next) {
        try {
            const province = await this.#service.getOne(req.params);

            res.json(province);
        } catch (error) {
            next(error);
        }
    }

    async update(req, res, next) {
        try {
            await this.#service.update(req.params, req.body);

            res.json({ message: ProvinceMessage.EditSuccess });
        } catch (error) {
            next(error);
        }
    }

    async delete(req, res, next) {
        try {
            await this.#service.delete(req.params);

            res.json({ message: ProvinceMessage.DeleteSuccess });
        } catch (error) {
            next(error);
        }
    }

    async deleteMany(req, res, next) {
        try {
            await this.#service.deleteMany(req.body);

            res.json({ message: ProvinceMessage.DeleteSuccess });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = ProvinceController;
