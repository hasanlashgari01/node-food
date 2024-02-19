const createHttpError = require("http-errors");
const RestaurantMessage = require("./restaurant.messages");
const { isValidObjectId } = require("mongoose");
const RestaurantModel = require("./restaurant.schema");
const MenuModel = require("../menu/menu.schema");
const UserModel = require("../user/user.schema");

class RestaurantService {
    #model;
    #menuModel;
    #userModel;
    constructor() {
        this.#model = RestaurantModel;
        this.#menuModel = MenuModel;
        this.#userModel = UserModel;
    }

    async create(restaurantDto, userDto) {
        const { order_start, order_end, average_delivery_time } = restaurantDto;

        const resultCreateRestaurant = await this.#model.create({
            ...restaurantDto,
            order: { order_start, order_end },
            details: { average_delivery_time },
            author: userDto._id,
        });
        if (!resultCreateRestaurant) throw new createHttpError.InternalServerError(RestaurantMessage.CreateFailed);
        const resultPushRestaurantID = await this.#userModel.updateOne(
            { _id: userDto._id },
            { $push: { restaurants: resultCreateRestaurant._id } }
        );
        if (resultPushRestaurantID.modifiedCount === 0)
            throw createHttpError.BadRequest(RestaurantMessage.CreatedFailed);
    }

    async getOne(id) {
        const restaurant = await this.isValidRestaurant(id);
        const menu = await this.#menuModel.find({ restaurantId: restaurant._id }, "-__v").populate("foods", "-__v");

        return { restaurant, menu };
    }

    async update(id, restaurantDto, userDto) {
        if (id === userDto._id.toString()) throw createHttpError.BadRequest(RestaurantMessage.NotAdmin);
        await this.isValidRestaurant(id);
        if (!Object.keys(restaurantDto).length) throw createHttpError.BadRequest(RestaurantMessage.EditFieldsNotEmpty);
        const update = await this.#model.updateOne({ _id: id }, restaurantDto);
        if (update.modifiedCount === 0) throw new createHttpError.BadRequest(RestaurantMessage.EditFailed);
    }

    async delete(id, userDto) {
        if (id === userDto._id.toString()) throw createHttpError.BadRequest(RestaurantMessage.NotAdmin);
        await this.isValidRestaurant(id);
        const result = await this.#model.deleteOne({ _id: id });
        if (result.deletedCount === 0) throw new createHttpError.NotFound(RestaurantMessage.NotExist);
    }

    async isValidRestaurant(id) {
        if (!isValidObjectId(id)) throw new createHttpError.BadRequest(RestaurantMessage.IdNotValid);
        const restaurant = await this.#model.findById(id).populate("author", "-otp");
        if (!restaurant) throw new createHttpError.NotFound(RestaurantMessage.NotExist);
        if (!restaurant.isValid) throw createHttpError.ServiceUnavailable(RestaurantMessage.NotValidRestaurant);
        return restaurant;
    }
}

module.exports = RestaurantService;
