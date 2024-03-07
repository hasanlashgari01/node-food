const autoBind = require("auto-bind");
const OrderService = require("./order.service");
const OrderMessage = require("./order.messages");

class OrderController {
    #service;

    constructor() {
        autoBind(this);
        this.#service = new OrderService();
    }

    async create(req, res, next) {
        try {
            await this.#service.create(req.body, req.user, req.body.food, req.body.restaurant);

            res.status(200).json({ message: OrderMessage.CreateSuccess });
        } catch (error) {
            next(error);
        }
    }

    async getAll(req, res, next) {
        try {
            const orders = await this.#service.getAll(req.user);

            res.json({ count: orders.length, orders });
        } catch (error) {
            next(error);
        }
    }

    async payOrder(req, res, next) {
        try {
            await this.#service.payOrder(req.params, req.user);

            res.json({ message: OrderMessage.PaymentSuccess });
        } catch (error) {
            next(error);
        }
    }

    async allUsersHaveNotOrder(req, res, next) {
        try {
            const users = await this.#service.allUsersHaveNotOrder();

            res.json({ count: users.length, users });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = OrderController;
