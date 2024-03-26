const autoBind = require("auto-bind");
const HomeService = require("./home.service");
const cookieParser = require("cookie-parser");

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
            const { province } = req?.query;
            const foods = await this.#service.getAllFoodParty(province);

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
            const { province } = req?.query;
            const foods = await this.#service.getListFoodsParty(province);

            res.json({ count: foods.length, foods });
        } catch (error) {
            next(error);
        }
    }

    async getNewestRestaurant(req, res, next) {
        try {
            const { province } = req.query;
            const restaurants = await this.#service.getNewestRestaurant(province);

            res.json({ count: restaurants.length, restaurants });
        } catch (error) {
            next(error);
        }
    }

    async getRestaurants(req, res, next) {
        try {
            const { province } = req?.query;
            const restaurants = await this.#service.getRestaurantByProvince(province);

            res.json({ count: restaurants.length, restaurants });
        } catch (error) {
            next(error);
        }
    }

    async getBestRestaurants(req, res, next) {
        try {
            const { province } = req?.query;
            const restaurants = await this.#service.getBestRestaurants(province);

            res.json({ count: restaurants.length, restaurants });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = HomeController;
