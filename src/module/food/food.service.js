const createHttpError = require("http-errors");
const { isValidObjectId } = require("mongoose");
const FoodModel = require("./food.schema");
const RestaurantModel = require("../restaurant/restaurant.schema");
const MenuModel = require("../menu/menu.schema");
const UserModel = require("../user/user.schema");
const FoodMessage = require("./food.messages");
const MenuMessage = require("../menu/menu.messages");
const RestaurentMessage = require("../restaurant/restaurant.messages");

class FoodService {
    #model;
    #restaurantModel;
    #menuModel;
    #userModel;
    constructor() {
        this.#model = FoodModel;
        this.#restaurantModel = RestaurantModel;
        this.#menuModel = MenuModel;
        this.#userModel = UserModel;
    }

    async create(foodDto, userDto) {
        const { title, image, description, menuId, kind } = foodDto;
        const menu = await this.isValidMenu(menuId);
        await this.isAdmin(menu, userDto);
        const resultCreateFood = await this.#model.create({ title, image, description, menuId, kind });
        if (!resultCreateFood) throw new createHttpError.InternalServerError(FoodMessage.CreateFailed);
        const resultPushMenuID = await this.#menuModel.updateOne(
            { _id: menuId },
            { $push: { foods: resultCreateFood._id } }
        );
        if (resultPushMenuID.modifiedCount === 0) throw createHttpError.BadRequest(MenuMessage.CreatedFailed);
    }

    async update() {}

    async delete(id, userDto) {
        const { menuId } = await this.isValidFood(id);
        const menu = await this.isValidMenu(menuId);
        await this.isAdmin(menu, userDto);
        const result = await this.#model.deleteOne({ _id: id });
        if (result.deletedCount === 0) throw new createHttpError.NotFound(RestaurentMessage.NotExist);
        const resultPopMenuID = await this.#menuModel.updateOne({ _id: menuId }, { $pull: { foods: id } });
        if (resultPopMenuID.modifiedCount === 0) throw createHttpError.BadRequest(MenuMessage.DeleteFailed);
    }

    async isValidMenu(id) {
        if (!isValidObjectId(id)) throw new createHttpError.BadRequest(MenuMessage.IdNotValid);
        const menu = await this.#menuModel.findById(id);
        if (!menu) throw new createHttpError.NotFound(MenuMessage.NotExist);
        return menu;
    }

    async isValidFood(id) {
        if (!isValidObjectId(id)) throw new createHttpError.BadRequest(FoodMessage.IdNotValid);
        const food = await this.#model.findById(id);
        if (!food) throw new createHttpError.NotFound(FoodMessage.NotExist);
        return food;
    }

    async isAdmin({ restaurantId }, { restaurants }) {
        const isAdmin = restaurants.some((id) => id.toString() === restaurantId.toString());
        if (!isAdmin) throw createHttpError.BadRequest(RestaurentMessage.NotAdmin);
        return isAdmin;
    }
}

module.exports = FoodService;
