const createHttpError = require("http-errors");
const RestaurantModel = require("./restaurant.schema");
const RestaurentMessage = require("./restaurant.messages");
const { isValidObjectId } = require("mongoose");

class RestaurantService {
    #model;
    constructor() {
        this.#model = RestaurantModel;
    }

    async create(restaurantDto) {
        const { order_start, order_end, average_delivery_time } = restaurantDto;

        await this.#model.create({
            ...restaurantDto,
            order: { order_start, order_end },
            details: { average_delivery_time },
        });
    }

    async delete(id) {
        if (!isValidObjectId(id)) throw new createHttpError.BadRequest(RestaurentMessage.IdNotValid);
        const result = await this.#model.deleteOne({ _id: id });
        if (result.deletedCount === 0) throw new createHttpError.NotFound(RestaurentMessage.NotExist);
    }
}

module.exports = RestaurantService;
