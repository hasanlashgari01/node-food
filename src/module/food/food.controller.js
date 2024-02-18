const autoBind = require("auto-bind");
const FoodService = require("./food.service");
const FoodMessage = require("./food.messages");

class FoodController {
    #service;

    constructor() {
        autoBind(this);
        this.#service = new FoodService();
    }

    async create(req, res, next) {
        try {
            await this.#service.create(req.body, req.user, req.file);
            res.status(201).json({ message: FoodMessage.CreatedSuccess });
        } catch (error) {
            next(error);
        }
    }

    async update(req, res, next) {
        try {
            const { id } = req.params;
            await this.#service.update(id, req.body, req.user);

            res.json({ message: FoodMessage.EditSuccess });
        } catch (error) {
            next(error);
        }
    }

    async delete(req, res, next) {
        try {
            const { id } = req.params;
            await this.#service.delete(id, req.user);

            res.json({ message: FoodMessage.DeleteSuccess });
        } catch (error) {
            next(error);
        }
    }

    async deleteKind(req, res, next) {
        try {
            const { id } = req.params;
            await this.#service.deleteKind(id, req.user);

            res.json({ message: FoodMessage.DeleteSuccess });
        } catch (error) {
            next(error);
        }
    }

    async deleteKindMany(req, res, next) {
        try {
            const { id } = req.params;
            const { kindsId } = req.body;
            await this.#service.deleteKindMany(id, kindsId, req.user);

            res.json({ message: FoodMessage.DeleteSuccess });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = FoodController;
