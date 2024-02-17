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
            res.status(201).json({ message: RestaurentMessage.CreatedSuccess });
        } catch (error) {
            next(error);
        }
    }

    async getOne(req, res, next) {
        try {
            const { id } = req.params;
            const restaurant = await this.#service.getOne(id);

            res.json(restaurant);
        } catch (error) {
            next(error);
        }
    }

    async update(req, res, next) {
        try {
            const { id } = req.params;
            await this.#service.update(id, req.body);

            res.json({ message: RestaurentMessage.EditSuccess });
        } catch (error) {
            next(error);
        }
    }

    async delete(req, res, next) {
        try {
            const { id } = req.params;
            await this.#service.delete(id);

            res.json({ message: RestaurentMessage.DeleteSuccess });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = RestaurantController;
