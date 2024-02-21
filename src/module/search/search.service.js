const createHttpError = require("http-errors");
const RestaurantModel = require("../restaurant/restaurant.schema");
const SearchMessage = require("./search.messages");

class SearchService {
    #restaurantModel;

    constructor() {
        this.#restaurantModel = RestaurantModel;
    }

    async searchRestaurant(name, province) {
        if (!name && !province) throw createHttpError.BadRequest(SearchMessage.Query_Required);
        const searchAsField = [
            { name: { $regex: String(name) } },
            { province: { $regex: String(province) } }
        ];
        let result = [];
        if (name && province) {
            result = await this.#restaurantModel.find({ $and: searchAsField });
            return result;
        }

        result = await this.#restaurantModel.find({ $or: searchAsField });
        return result;
    }
}

module.exports = SearchService;
