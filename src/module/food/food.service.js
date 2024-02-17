const createHttpError = require("http-errors");
const slugify = require("slugify");
const { isValidObjectId } = require("mongoose");
const FoodModel = require("./food.schema");
const MenuMessage = require("./menu.messages");
const MenuModel = require("./menu.schema");
const RestaurantModel = require("../restaurant/restaurant.schema");
const UserModel = require("../user/user.schema");
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

    async create() {}

    async update() {}

    async delete() {}
}

module.exports = FoodService;
