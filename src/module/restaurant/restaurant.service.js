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

    async getOne(id) {
        return await this.isValidRestaurant(id);
    }

    async update(id, restaurantDto) {
        await this.isValidRestaurant(id);
        if (!Object.keys(restaurantDto).length) throw createHttpError.BadRequest(RestaurentMessage.EditFieldsNotEmpty);
        const update = await this.#model.updateOne({ _id: id }, restaurantDto);
        if (update.modifiedCount === 0) throw new createHttpError.BadRequest(RestaurentMessage.EditFailed);
    }

    async delete(id) {
        await this.isValidRestaurant(id);
        const result = await this.#model.deleteOne({ _id: id });
        if (result.deletedCount === 0) throw new createHttpError.NotFound(RestaurentMessage.NotExist);
    }

    async isValidRestaurant(id) {
        if (!isValidObjectId(id)) throw new createHttpError.BadRequest(RestaurentMessage.IdNotValid);
        const restaurant = await this.#model.findById(id);
        if (!restaurant) throw new createHttpError.NotFound(RestaurentMessage.NotExist);
        if (!restaurant.isValid) throw createHttpError.ServiceUnavailable(RestaurentMessage.NotValidRestaurant);
        return restaurant;
    }
}

module.exports = RestaurantService;
