const createHttpError = require("http-errors");
const { isValidObjectId } = require("mongoose");
const FoodModel = require("./food.schema");
const RestaurantModel = require("../restaurant/restaurant.schema");
const MenuModel = require("../menu/menu.schema");
const UserModel = require("../user/user.schema");
const FoodMessage = require("./food.messages");
const MenuMessage = require("../menu/menu.messages");
const RestaurantMessage = require("../restaurant/restaurant.messages");
const KindOfFoodModel = require("./food-kind.schema");

class FoodService {
    #model;
    #kindOfFoodModel;
    #restaurantModel;
    #menuModel;
    #userModel;
    constructor() {
        this.#model = FoodModel;
        this.#kindOfFoodModel = KindOfFoodModel;
        this.#restaurantModel = RestaurantModel;
        this.#menuModel = MenuModel;
        this.#userModel = UserModel;
    }

    async create(foodDto, userDto) {
        const { title, image, description, menuId, kind } = foodDto;
        const menu = await this.isValidMenu(menuId);
        await this.isAdmin(menu, userDto);
        const resultKindOfFood = await this.#kindOfFoodModel.create({ foods: kind });
        const resultCreateFood = await this.#model.create({
            title,
            image,
            description,
            menuId,
            kindId: resultKindOfFood._id,
        });
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
        const result = await this.#model.findByIdAndDelete(id);
        await this.#kindOfFoodModel.deleteOne(result.kindId);
        if (result.deletedCount === 0) throw new createHttpError.NotFound(RestaurantMessage.NotExist);
        const resultPopMenuID = await this.#menuModel.updateOne({ _id: menuId }, { $pull: { foods: id } });
        if (resultPopMenuID.modifiedCount === 0) throw createHttpError.BadRequest(MenuMessage.DeleteFailed);
    }

    async deleteKind(id, userDto) {
        const iskindOfFood = await this.isValidKindFood(id);
        const { menuId } = await this.isValidFoodByKindID(iskindOfFood._id);
        await this.isAdmin(menuId, userDto);
        const resultPopKindOfFoodID = await this.#kindOfFoodModel.updateOne(
            { _id: iskindOfFood._id },
            { $pull: { foods: { _id: id } } }
        );
        if (resultPopKindOfFoodID.modifiedCount === 0) throw createHttpError.BadRequest(MenuMessage.DeleteFailed);
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

    async isValidFoodByKindID(id) {
        if (!isValidObjectId(id)) throw new createHttpError.BadRequest(FoodMessage.IdNotValid);
        const food = await this.#model.findOne({ kindId: id }).populate("menuId");
        if (!food) throw new createHttpError.NotFound(FoodMessage.NotExist);
        return food;
    }

    async isValidKindFood(id) {
        if (!isValidObjectId(id)) throw new createHttpError.BadRequest(FoodMessage.IdNotValid);
        const food = await this.#kindOfFoodModel.findOne({ "foods._id": id });
        if (!food) throw new createHttpError.NotFound(FoodMessage.NotExist);
        return food;
    }

    async isAdmin({ restaurantId }, { restaurants }) {
        const isAdmin = restaurants.some((id) => id.toString() === restaurantId.toString());
        if (!isAdmin) throw createHttpError.BadRequest(RestaurantMessage.NotAdmin);
        return isAdmin;
    }
}

module.exports = FoodService;
