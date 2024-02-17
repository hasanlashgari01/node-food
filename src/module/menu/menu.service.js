const createHttpError = require("http-errors");
const slugify = require("slugify");
const { isValidObjectId } = require("mongoose");
const MenuModel = require("./menu.schema");
const MenuMessage = require("./menu.messages");
const RestaurantModel = require("../restaurant/restaurant.schema");
const UserModel = require("../user/user.schema");
const RestaurentMessage = require("../restaurant/restaurant.messages");

class RestaurantService {
    #model;
    #restaurantModel;
    #userModel;
    constructor() {
        this.#model = MenuModel;
        this.#restaurantModel = RestaurantModel;
        this.#userModel = UserModel;
    }

    async create(restaurantDto, userDto) {
        const { title, image, slug, restaurantId } = restaurantDto;
        await this.isValidRestaurant(restaurantId);
        await this.isAdmin(restaurantId, userDto);
        const genrateSlug = await slugify(slug);
        const isExistSlug = await this.#model.findOne({ slug: genrateSlug });
        if (isExistSlug) throw new createHttpError.BadRequest(MenuMessage.AlreadyExist);
        const resultCreateRestaurant = await this.#model.create({ title, image, slug: genrateSlug, restaurantId });
        if (!resultCreateRestaurant) throw new createHttpError.InternalServerError(MenuMessage.CreateFailed);
    }

    async update(id, restaurantDto, userDto) {
        const { title, image, slug, restaurantId } = restaurantDto;
        await this.isValidRestaurant(restaurantId);
        await this.isAdmin(restaurantId, userDto);
        if (Object.keys(restaurantDto).length <= 1)
            throw createHttpError.BadRequest(RestaurentMessage.EditFieldsNotEmpty);
        const update = await this.#model.updateOne({ _id: id }, { title, image, slug });
        if (update.modifiedCount === 0) throw new createHttpError.BadRequest(MenuMessage.EditFailed);
    }

    async delete(id, userDto) {
        const { restaurantId } = await this.isValidMenu(id);
        await this.isValidRestaurant(restaurantId);
        await this.isAdmin(restaurantId, userDto);
        const result = await this.#model.deleteOne({ _id: id });
        if (result.deletedCount === 0) throw new createHttpError.NotFound(RestaurentMessage.NotExist);
    }

    async isValidRestaurant(id) {
        if (!isValidObjectId(id)) throw new createHttpError.BadRequest(RestaurentMessage.IdNotValid);
        const restaurant = await this.#restaurantModel.findById(id);
        if (!restaurant) throw new createHttpError.NotFound(RestaurentMessage.NotExist);
        if (!restaurant.isValid) throw createHttpError.ServiceUnavailable(RestaurentMessage.NotValidRestaurant);
        return restaurant;
    }

    async isValidMenu(id) {
        if (!isValidObjectId(id)) throw new createHttpError.BadRequest(MenuMessage.IdNotValid);
        const menu = await this.#model.findById(id);
        if (!menu) throw new createHttpError.NotFound(MenuMessage.NotExist);
        return menu;
    }

    async isAdmin(restaurantId, { restaurants }) {
        const isAdmin = restaurants.some((id) => id.toString() === restaurantId.toString());
        console.log("🚀 ~ RestaurantService ~ isAdmin ~ isAdmin:", isAdmin);
        if (!isAdmin) throw createHttpError.BadRequest(RestaurentMessage.NotAdmin);
        return isAdmin;
    }
}

module.exports = RestaurantService;
