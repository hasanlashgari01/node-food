const autoBind = require("auto-bind");
const { isValidObjectId } = require("mongoose");
const slugify = require("slugify");
const createHttpError = require("http-errors");
const fs = require("fs");
const UserModel = require("../user/user.schema");
const AdminMessage = require("./admin.messages");
const RestaurantModel = require("./../restaurant/restaurant.schema");
const BanRestaurantModel = require("./../ban-restautant/ban-restautant.schema");
const RestaurentMessage = require("../restaurant/restaurant.messages");
const SuggestionMenuModel = require("../menu/menu-suggestion.schema");

class AdminService {
    #model;
    #restaurantModel;
    #banRestaurantModel;
    #suggestionMenuModel;

    constructor() {
        autoBind(this);
        this.#model = UserModel;
        this.#restaurantModel = RestaurantModel;
        this.#banRestaurantModel = BanRestaurantModel;
        this.#suggestionMenuModel = SuggestionMenuModel;
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

    async acceptOrRejectRestaurant(id, isValid) {
        const updateResult = await this.#restaurantModel.updateOne({ _id: id }, { isValid: !isValid });
        if (!updateResult.modifiedCount) throw createHttpError.BadRequest(isValid ? AdminMessage.RestaurantRejectFailed : AdminMessage.RestaurantRejectSuccess);
    }

    async banRestaurant(id) {
        const banResult = await this.#banRestaurantModel.create({ restaurantId: id });
        if (!banResult) throw createHttpError.BadRequest(AdminMessage.RestaurantBanFailed);
    }

    async removeRestaurantBan(id) {
        const banResult = await this.#banRestaurantModel.deleteOne({ restaurantId: id });
        if (!banResult) throw createHttpError.BadRequest(AdminMessage.RestaurantRemoveBanFailed);
    }

    async getRestaurant(id) {
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

    async checkIsNotBanRestaurant(id) {
        const isBanRestauRent = await this.#banRestaurantModel.findOne({ restaurantId: id });
        if (!isBanRestauRent) throw new createHttpError.NotFound(AdminMessage.RestaurantIsNotBanned);
    }

    // Menu
    async createSuggestionMenu(menuDto, fileDto) {
        const { title, slug } = menuDto;
        const genrateSlug = await slugify(slug);
        const result = await this.#suggestionMenuModel.create({ title, image: fileDto.filename, slug: genrateSlug });
        if (!result) throw createHttpError.Bad_Request(AdminMessage.SuggestionMenuCreateFailed);
    }

    async editSuggestionMenu(id, menuDto, fileDto) {
        const { title, slug } = menuDto;
        const result = await this.#suggestionMenuModel.updateOne({ _id: id }, { title, image: fileDto.filename, slug });
        if (!result.modifiedCount) throw createHttpError.Bad_Request(AdminMessage.SuggestionMenuEditFailed);
    }

    async removeSuggestionMenu(id) {
        const result = await this.#suggestionMenuModel.deleteOne({ _id: id });
        if (!result.deletedCount) throw createHttpError.Bad_Request(AdminMessage.SuggestionMenuRemoveFailed);
    }

    async allSuggestionMenu() {
        const result = await this.#suggestionMenuModel.find().lean();

        return result;
    }

    async checkAlreadySuggestionMenu(title, slug, fileDto) {
        const isTitle = await this.#suggestionMenuModel.findOne({ title }).lean();
        if (isTitle) {
            fs.unlinkSync(`public/uploads/menu/${fileDto.filename}`);
            throw new createHttpError.Conflict(AdminMessage.SuggestionMenuTitleAlreadyExist);
        }
        const isSlug = await this.#suggestionMenuModel.findOne({ slug }).lean();
        if (isSlug) {
            fs.unlinkSync(`public/uploads/menu/${fileDto.filename}`);
            throw new createHttpError.Conflict(AdminMessage.SuggestionMenuSlugAlreadyExist);
        }
    }

    async checkIsValidSuggestionMenu(id) {
        if (!isValidObjectId(id)) throw new createHttpError.BadRequest(AdminMessage.IdNotValid);
        const menu = await this.#suggestionMenuModel.findById(id);
        if (!menu) throw new createHttpError.NotFound(AdminMessage.SuggestionMenuNotExist);
    }

}

module.exports = AdminService;
