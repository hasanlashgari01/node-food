const autoBind = require("auto-bind");
const { isValidObjectId } = require("mongoose");
const createHttpError = require("http-errors");
const UserModel = require("../user/user.schema");
const AdminMessage = require("./admin.messages");
const RestaurantModel = require("./../restaurant/restaurant.schema");
const RestaurentMessage = require("../restaurant/restaurant.messages");

class AdminService {
    #model;
    #restaurantModel;

    constructor() {
        autoBind(this);
        this.#model = UserModel;
        this.#restaurantModel = RestaurantModel;
    }

    async allRestaurant() {
        const restaurantCount = await this.#restaurantModel.find().count();
        const restaurants = await this.#restaurantModel.find().lean();

        return { restaurantCount,restaurants };
    }

    async getRestaurant(id) {
        const restaurant = await this.isValidRestaurant(id);

        return restaurant;
    }

    async isValidRestaurant(id) {
        if (!isValidObjectId(id)) throw new createHttpError.BadRequest(RestaurentMessage.IdNotValid);
        const restaurant = await this.#restaurantModel.findById(id).populate("author", "-otp");
        if (!restaurant) throw new createHttpError.NotFound(RestaurentMessage.NotExist);
        if (!restaurant.isValid) throw createHttpError.ServiceUnavailable(RestaurentMessage.NotValidRestaurant);
        return restaurant;
    }
}

module.exports = AdminService;
