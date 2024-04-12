const createHttpError = require("http-errors");
const slugify = require("slugify");
const { isValidObjectId } = require("mongoose");
const MenuModel = require("./menu.schema");
const MenuMessage = require("./menu.messages");
const RestaurantModel = require("../restaurant/restaurant.schema");
const UserModel = require("../user/user.schema");
const RestaurantMessage = require("../restaurant/restaurant.messages");
const BanRestaurantModel = require("../ban-restautant/ban-restautant.schema");

class RestaurantService {
    #model;
    #restaurantModel;
    #banRestaurantModel;
    #userModel;
    constructor() {
        this.#model = MenuModel;
        this.#restaurantModel = RestaurantModel;
        this.#banRestaurantModel = BanRestaurantModel;
        this.#userModel = UserModel;
    }

    async create(restaurantDto) {
        const { title, slug, restaurantId } = restaurantDto;
        const genrateSlug = await slugify(slug);
        const isExistSlug = await this.#model.findOne({ slug: genrateSlug });
        if (isExistSlug) throw new createHttpError.BadRequest(MenuMessage.AlreadyExist);
        const resultCreateMenu = await this.#model.create({
            title,
            slug: genrateSlug.toLowerCase(),
            restaurantId,
        });
        if (!resultCreateMenu) throw new createHttpError.InternalServerError(MenuMessage.CreateFailed);
    }

    async update(id, restaurantDto) {
        if (Object.keys(restaurantDto).length <= 1)
            throw createHttpError.BadRequest(RestaurantMessage.EditFieldsNotEmpty);
        const { title, slug } = restaurantDto;
        const genrateSlug = await slugify(slug);
        const isExistSlug = await this.#model.findOne({ slug: genrateSlug });
        if (isExistSlug && isExistSlug._id != id) throw new createHttpError.BadRequest(MenuMessage.AlreadyExist);
        const update = await this.#model.updateOne({ _id: id }, { title, slug: genrateSlug.toLowerCase() });
        if (update.modifiedCount === 0 && update.matchedCount === 0)
            throw new createHttpError.BadRequest(MenuMessage.EditFailed);
    }

    async delete(id) {
        const result = await this.#model.deleteOne({ _id: id });
        if (result.deletedCount === 0) throw new createHttpError.NotFound(RestaurantMessage.NotExist);
    }

    async getMenuBySlug(slug) {
        return await this.#model.findOne({ slug });
    }

    async getMenuById(menuId) {
        return await this.#model.findById(menuId);
    }

    async isValidRestaurant(id) {
        if (!isValidObjectId(id)) throw new createHttpError.BadRequest(RestaurantMessage.IdNotValid);
        const restaurant = await this.#restaurantModel.findById(id);
        if (!restaurant) throw new createHttpError.NotFound(RestaurantMessage.NotExist);
        if (!restaurant.isValid) throw createHttpError.ServiceUnavailable(RestaurantMessage.NotValidRestaurant);
        return restaurant;
    }

    async isValidMenu(id) {
        if (!isValidObjectId(id)) throw new createHttpError.BadRequest(MenuMessage.IdNotValid);
        const menu = await this.#model.findById(id);
        if (!menu) throw new createHttpError.NotFound(MenuMessage.NotExist);
        return menu;
    }

    async isRestaurantAdmin(restaurantId, { restaurants }) {
        const isAdmin = restaurants.some((id) => id.toString() === restaurantId.toString());
        if (!isAdmin) throw createHttpError.BadRequest(RestaurantMessage.NotAdmin);
        return isAdmin;
    }

    async checkIsBanRestaurant(id) {
        const isBanRestaurant = await this.#banRestaurantModel.findOne({ restaurantId: id });
        if (isBanRestaurant) throw new createHttpError.NotFound(RestaurantMessage.RestaurantBanned);
    }
}

module.exports = RestaurantService;
