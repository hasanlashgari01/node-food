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
            const { name, province } = req.query;
            const result = await this.#service.searchRestaurant(name,  province);

            res.send({ count: result.length, result });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = SearchController;
