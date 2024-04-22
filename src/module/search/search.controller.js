const autoBind = require("auto-bind");
const SearchService = require("./search.service");

class SearchController {
    #service;

    constructor() {
        autoBind(this);
        this.#service = new SearchService();
    }

    async searchRestaurantAndFood(req, res, next) {
        try {
            const { restaurants, foods } = await this.#service.searchRestaurantAndFood(req.query);
            const count = restaurants.length + foods.length;

            res.send({ count, restaurants, foods });
        } catch (error) {
            next(error);
        }
    }

    async searchUser(req, res, next) {
        try {
            const result = await this.#service.searchUser(req.body);

            res.send({ count: result.length, result });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = SearchController;
