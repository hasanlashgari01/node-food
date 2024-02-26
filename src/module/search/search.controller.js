const autoBind = require("auto-bind");
const SearchService = require("./search.service");
const SearchMessage = require("./search.messages");

class SearchController {
    #service;

    constructor() {
        autoBind(this);
        this.#service = new SearchService();
    }

    async searchRestaurant(req, res, next) {
        try {
            const result = await this.#service.searchRestaurant(req.body);

            res.send({ count: result.length, result });
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
