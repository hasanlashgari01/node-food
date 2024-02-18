const autoBind = require("auto-bind");
const RestaurantService = require("./restaurant.service");
const RestaurantMessage = require("./restaurant.messages");

class RestaurantController {
    #service;

    constructor() {
        autoBind(this);
        this.#service = new RestaurantService();
    }

    async create(req, res, next) {
        try {
            await this.#service.create(req.body, req.user);
            res.status(201).json({ message: RestaurantMessage.CreatedSuccess });
        } catch (error) {
            next(error);
        }
    }

    async getOne(req, res, next) {
        try {
            const { id } = req.params;
            const { restaurant, menu } = await this.#service.getOne(id);

            res.json({ restaurant, menu });
        } catch (error) {
            next(error);
        }
    }

    async update(req, res, next) {
        try {
            const { id } = req.params;
            await this.#service.update(id, req.body, req.user);

            res.json({ message: RestaurantMessage.EditSuccess });
        } catch (error) {
            next(error);
        }
    }

    async delete(req, res, next) {
        try {
            const { id } = req.params;
            await this.#service.delete(id, req.user);

            res.json({ message: RestaurantMessage.DeleteSuccess });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = RestaurantController;
