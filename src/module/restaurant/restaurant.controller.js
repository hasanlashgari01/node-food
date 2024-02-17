const autoBind = require("auto-bind");
const RestaurantService = require("./restaurant.service");

class RestaurantController {
    #service;

    constructor() {
        autoBind(this);
        this.#service = new RestaurantService();
    }

    async create(req, res, next) {
        try {
            return res.json({ message: "ok" });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = RestaurantController;
