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
            const field = Object.keys(error.keyPattern);
            if (field[0] === "slug") error.message = RestaurantMessage.AlreadyExist;
            if (field[0] === "phone") error.message = RestaurantMessage.AlreadyExist;
            if (field[0] === "email") error.message = RestaurantMessage.AlreadyExist;

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

    async getRestaurantBySlug(req, res, next) {
        try {
            const { slug } = req.params;
            const restaurant = await this.#service.getRestaurantBySlug(slug);

            res.json(restaurant);
        } catch (error) {
            next(error);
        }
    }

    async allComments(req, res, next) {
        try {
            const { id } = req.params;
            const { comments } = await this.#service.getAllComments(id);

            res.json({ count: comments.length, comments });
        } catch (error) {
            next(error);
        }
    }

    async changeStatus(req, res, next) {
        try {
            const { id } = req.params;
            const { status } = req.body;

            res.json({ message: "کامنت با موفقیت آپدیت شد" });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = RestaurantController;
