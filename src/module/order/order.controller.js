const autoBind = require("auto-bind");
const OrderService = require("./order.service");
const OrderMessage = require("./order.messages");

class OrderController {
    #service;

    constructor() {
        autoBind(this);
        this.#service = new OrderService();
    }
}

module.exports = OrderController;
