const createHttpError = require("http-errors");
const RestaurantModel = require("../restaurant/restaurant.schema");
const UserModel = require("../user/user.schema");
const SearchMessage = require("./search.messages");

class SearchService {
    #restaurantModel;
    #userModel;

    constructor() {
        this.#restaurantModel = RestaurantModel;
        this.#userModel = UserModel;
    }

    async searchRestaurant(restaurantDto) {
        let restaurantDtoToList = Object.keys(restaurantDto);
        if (!restaurantDtoToList.length) throw createHttpError.BadRequest(SearchMessage.Query_Required);
        let { name, province } = restaurantDto;
        let searchAsField = [];
        let result = [];

        restaurantDtoToList.forEach(item => {
            searchAsField.push({ [item]: { $regex: ".*" + restaurantDto[item] + ".*" } });
            return searchAsField;
        });

        if (restaurantDtoToList.length > 1) {
            result = await this.#restaurantModel.find({ $and: searchAsField });
            return result;
        }

        result = await this.#restaurantModel.find({ $or: searchAsField });
        return result;
    }

    async searchUser(userDto) {
        let userDtoToList = Object.keys(userDto);
        if (!userDtoToList.length) throw createHttpError.BadRequest(SearchMessage.Query_Required);
        let { fullName, mobile, email } = userDto;
        let searchAsField = [];
        let result = [];

        userDtoToList.forEach(item => {
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
