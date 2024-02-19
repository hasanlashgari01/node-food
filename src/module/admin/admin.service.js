const autoBind = require("auto-bind");
const { isValidObjectId } = require("mongoose");
const createHttpError = require("http-errors");
const UserModel = require("../user/user.schema");
const AdminMessage = require("./admin.messages");
const RestaurantModel = require("./../restaurant/restaurant.schema");
const BanRestaurantModel = require("./../ban-restautant/ban-restautant.schema");
const RestaurentMessage = require("../restaurant/restaurant.messages");

class AdminService {
    #model;
    #restaurantModel;
    #banRestaurantModel;

    constructor() {
        autoBind(this);
        this.#model = UserModel;
        this.#restaurantModel = RestaurantModel;
        this.#banRestaurantModel = BanRestaurantModel;
    }

    async allRestaurant() {
        const restaurantCount = await this.#restaurantModel.find().count();
        const restaurants = await this.#restaurantModel.find().lean();

        return { restaurantCount, restaurants };
    }

    async allRestaurantBanned() {
        const restaurantBannedCount = await this.#banRestaurantModel.find().count();
        const restaurantsBanned = await this.#banRestaurantModel.find().select("-__v").populate("restaurantId", "name phone email province category").lean();

        return { restaurantBannedCount, restaurantsBanned };
    }

    async banRestaurant(id) {
        const { isValid } = await this.checkIsValidRestaurant(id);
        await this.checkIsBanRestaurant(id);
        const banResult = await this.#banRestaurantModel.create({ restaurantId: id });
        if (!banResult) throw createHttpError.BadRequest(AdminMessage.RestaurantBanFailed);

        return { isValid };
    }

    async AcceptOrRejectRestaurant(id) {
        const { isValid } = await this.checkIsValidRestaurant(id);
        await this.checkIsBanRestaurant(id);
        const updateResult = await this.#restaurantModel.updateOne({ _id: id }, { isValid: !isValid });
        if (!updateResult.modifiedCount) throw createHttpError.BadRequest(isValid ? AdminMessage.RestaurantRejectFailed : AdminMessage.RestaurantRejectSuccess);

        return { isValid };
    }

    async getRestaurant(id) {
        const restaurant = await this.checkIsValidRestaurant(id);
        await this.checkIsBanRestaurant(id);

        return restaurant;
    }

    async checkIsValidRestaurant(id) {
        if (!isValidObjectId(id)) throw new createHttpError.BadRequest(RestaurentMessage.IdNotValid);
        const restaurant = await this.#restaurantModel.findById(id).populate("author", "-otp");
        if (!restaurant) throw new createHttpError.NotFound(RestaurentMessage.NotExist);

        return restaurant;
    }

    async checkIsBanRestaurant(id) {
        const isBanRestauRent = await this.#banRestaurantModel.findOne({ restaurantId: id });
        if (isBanRestauRent) throw new createHttpError.NotFound(RestaurentMessage.RestaurantBanned);
    }
}

module.exports = AdminService;
