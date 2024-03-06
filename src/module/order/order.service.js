const createHttpError = require("http-errors");
const { isValidObjectId } = require("mongoose");
const OrderModel = require("./order.schema");
const OrderMessage = require("./order.messages");

class OrderService {
    #model;
    constructor() {
        this.#model = OrderModel;
    }
}

module.exports = OrderService;
