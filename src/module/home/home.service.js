const CategoryModel = require("../category/category.schema");
const RestaurantModel = require("../restaurant/restaurant.schema");
const KindOfFoodModel = require("../food/food-kind.schema");

class HomeService {
    #categoryModel;
    #restaurantModel;
    #kindFoodModel;

    constructor() {
        this.#categoryModel = CategoryModel;
        this.#restaurantModel = RestaurantModel;
        this.#kindFoodModel = KindOfFoodModel;
    }

    async getAllCategory() {
        return await this.#categoryModel.find().lean();
    }

    async getAllFoodParty(province) {
        const restaurants = await this.getRestaurantByProvince(province);

        return await this.#kindFoodModel
            .find({ restaurantId: { $in: restaurants }, "discount.percent": { $gt: 0 } }, "-__v")
            .populate("restaurantId", "name slug province score isValid")
            .lean();
    }

    async getListCategory() {
        return await this.#categoryModel
            .find({ $or: [{ parent: null }, { parent: [] }] })
            .limit(12)
            .lean();
    }

    async getListFoodsParty(province) {
        const restaurants = await this.getRestaurantByProvince(province);

        return await this.#kindFoodModel
            .find({ restaurantId: { $in: restaurants }, "discount.percent": { $gt: 0 } }, "-__v")
            .populate("restaurantId", "name slug province score isValid")
            .limit(24)
            .lean();
    }

    async getRestaurantByProvince(province) {
        return await this.#restaurantModel.find({ "province.englishTitle": province }, "-__v");
    }
}

module.exports = HomeService;
