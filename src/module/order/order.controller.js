const autoBind = require("auto-bind");
const OrderService = require("./order.service");
const OrderMessage = require("./order.messages");

class OrderController {
    #service;

    constructor() {
        autoBind(this);
        this.#service = new OrderService();
    }

    async getOne(req, res, next) {
        try {
            const order = await this.#service.getOne(req.params, req.user);

            res.json(order);
        } catch (error) {
            next(error);
        }
    }

    async create(req, res, next) {
        try {
            await this.#service.create(req.body, req.user, req.body.food, req.body.restaurant);

            res.status(201).json({ message: OrderMessage.CreateSuccess });
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

    async cancelOrder(req, res, next) {
        try {
            await this.#service.cancelOrder(req.params, req.user);

            res.json({ message: OrderMessage.OrderCancelSuccess });
        } catch (error) {
            next(error);
        }
    }

    async getAllOrders(req, res, next) {
        try {
            const orders = await this.#service.getAllOrders(req.params, req.query);

            res.status(200).json({ count: orders.length, orders });
        } catch (error) {
            next(error);
        }
    }

    async getOrder(req, res, next) {
        try {
            const order = await this.#service.getOrder(req.params);

            res.status(200).json(order);
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

    async getOrdersByAdmin(req, res, next) {
        try {
            const orders = await this.#service.getAllOrdersByAdmin(req.query);

            res.status(200).json({ count: orders.length, orders });
        } catch (error) {
            next(error);
        }
    }

    async getOrder(req, res, next) {
        try {
            const order = await this.#service.getOrder(req.params);

            res.status(200).json(order);
        } catch (error) {
            next(error);
        }
    }
}

module.exports = OrderController;
