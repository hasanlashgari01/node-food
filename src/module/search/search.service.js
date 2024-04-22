const createHttpError = require("http-errors");
const RestaurantModel = require("../restaurant/restaurant.schema");
const UserModel = require("../user/user.schema");
const SearchMessage = require("./search.messages");
const FoodModel = require("../food/food.schema");

class SearchService {
    #restaurantModel;
    #foodModel;
    #userModel;

    constructor() {
        this.#restaurantModel = RestaurantModel;
        this.#foodModel = FoodModel;
        this.#userModel = UserModel;
    }

    async searchRestaurantAndFood(queryDto) {
        let queryList = Object.keys(queryDto);
        if (!queryList.length) throw createHttpError.BadRequest(SearchMessage.Query_Required);
        let searchAsFieldRestaurant = [];
        let searchAsFieldFood = [];
        let restaurants = [];
        let foods = [];

        queryList.forEach((item) => {
            searchAsFieldRestaurant.push({ [item]: { $regex: ".*" + queryDto[item] + ".*", $options: "i" } });
            return searchAsFieldRestaurant;
        });

        queryList.forEach((item) => {
            let title = item === "name" ? "title" : item;
            searchAsFieldFood.push({ [title]: { $regex: ".*" + queryDto[title] + ".*", $options: "i" } });
        });
        searchAsFieldFood.push({ description: { $regex: queryDto.name || queryDto.description || ".*" } });

        if (queryList.length > 1) {
            restaurants = await this.#restaurantModel
                .find({ $and: searchAsFieldRestaurant })
                .where({ isValid: true })
                .select("name logo score slug ");
            foods = await this.#foodModel
                .find({ $and: searchAsFieldFood })
                .select("_id title image description price rate");

            return { restaurants, foods };
        } else {
            restaurants = await this.#restaurantModel
                .find({ $or: searchAsFieldRestaurant })
                .where({ isValid: true })
                .select("name logo score slug ");
            foods = await this.#foodModel
                .find({ $or: searchAsFieldFood })
                .select("_id title image description price rate");

            return { restaurants, foods };
        }
    }

    async searchUser(userDto) {
        let userDtoToList = Object.keys(userDto);
        if (!userDtoToList.length) throw createHttpError.BadRequest(SearchMessage.Query_Required);
        let { fullName, mobile, email } = userDto;
        let searchAsField = [];
        let result = [];

        userDtoToList.forEach((item) => {
            searchAsField.push({ [item]: { $regex: ".*" + userDto[item] + ".*" } });
            return searchAsField;
        });

        if (userDtoToList.length > 1) {
            result = await this.#userModel.find({ $and: searchAsField }, "fullName mobile email role");
            return result;
        }

        result = await this.#userModel.find({ $or: searchAsField }, "fullName mobile email role");
        return result;
    }
}

module.exports = SearchService;
