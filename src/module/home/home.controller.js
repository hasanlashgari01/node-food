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
            const { user_province } = req?.cookies;
            const foods = await this.#service.getListFoodsParty(user_province);

            res.json({ count: foods.length, foods });
        } catch (error) {
            next(error);
        }
    }

    async getNewestRestaurant(req, res, next) {
        try {
            const { user_province } = req?.cookies;
            const restaurants = await this.#service.getNewestRestaurant(user_province);

            res.json({ count: restaurants.length, restaurants });
        } catch (error) {
            next(error);
        }
    }

    async getRestaurants(req, res, next) {
        try {
            const { user_province } = req?.cookies;
            const restaurants = await this.#service.getRestaurantByProvince(user_province);

            res.json({ count: restaurants.length, restaurants });
        } catch (error) {
            next(error);
        }
    }

    async getBestRestaurants(req, res, next) {
        try {
            const { user_province } = req?.cookies;
            const restaurants = await this.#service.getBestRestaurants(user_province);

            res.json({ count: restaurants.length, restaurants });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = HomeController;
