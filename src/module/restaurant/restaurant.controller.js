const autoBind = require("auto-bind");
const RestaurantService = require("./restaurant.service");
const RestaurentMessage = require("./restaurant.messages");

class RestaurantController {
    #service;

    constructor() {
        autoBind(this);
        this.#service = new RestaurantService();
    }

    async create(req, res, next) {
        try {
            await this.#service.create(req.body);
            res.status(201).json({ message: RestaurentMessage.CREATE });
        } catch (error) {
            next(error);
        }
    }

    async delete(req, res, next) {
        try {
            const { id } = req.params;
            await this.#service.delete(id);

            res.status(201).json({ message: RestaurentMessage.Delete });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = RestaurantController;
