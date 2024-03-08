const autoBind = require("auto-bind");
const HomeService = require("./home.service");

class HomeController {
    #service;

    constructor() {
        autoBind(this);
        this.#service = new HomeService();
    }

    async getCategories(req, res, next) {
        try {
            const categories = await this.#service.getAllCategory();

            res.json({ count: categories.length, categories });
        } catch (error) {
            next(error);
        }
    }

    async getFoodsParty(req, res, next) {
        try {
            const { user_province } = req?.cookies;
            const foods = await this.#service.getAllFoodParty(user_province);

            res.json({ count: foods.length, foods });
        } catch (error) {
            next(error);
        }
    }

    async getListCategories(req, res, next) {
        try {
            const foods = await this.#service.getListCategory();

            res.json({ count: foods.length, foods });
        } catch (error) {
            next(error);
        }
    }

    async getListFoodsParty(req, res, next) {
        try {
            const foods = await this.#service.getListFoodsParty();

            res.json({ count: foods.length, foods });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = HomeController;
