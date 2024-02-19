const autoBind = require("auto-bind");
const { isValidObjectId } = require("mongoose");
const slugify = require("slugify");
const createHttpError = require("http-errors");
const UserModel = require("../user/user.schema");
const AdminMessage = require("./admin.messages");
const RestaurantModel = require("./../restaurant/restaurant.schema");
const BanRestaurantModel = require("./../ban-restautant/ban-restautant.schema");
const RestaurentMessage = require("../restaurant/restaurant.messages");
const MenuSuggestionModel = require("../menu/menu-suggestion.schema");
const fs = require("fs");
const removeFile = require("../../common/utils/file");

class AdminService {
    #model;
    #restaurantModel;
    #banRestaurantModel;
    #menuSuggestionModel;

    constructor() {
        autoBind(this);
        this.#model = UserModel;
        this.#restaurantModel = RestaurantModel;
        this.#banRestaurantModel = BanRestaurantModel;
        this.#menuSuggestionModel = MenuSuggestionModel;
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
    async createMenuSuggestion(menuDto, fileDto) {
        const { title, slug } = menuDto;
        const genrateSlug = await slugify(slug);
        const result = await this.#menuSuggestionModel.create({ title, image: fileDto.filename, slug: genrateSlug });
        if (!result) throw createHttpError.Bad_Request(AdminMessage.MenuSuggestionCreateFailed);
    }

    async checkAlreadyMenuSuggestion(title, slug, fileDto) {
        const isTitle = await this.#menuSuggestionModel.findOne({ title }).lean();
        if (isTitle) {
            fs.unlinkSync(`public/uploads/menu/${fileDto.filename}`);
            throw new createHttpError.Conflict(AdminMessage.MenuSuggestionTitleAlreadyExist);
        }
        const isSlug = await this.#menuSuggestionModel.findOne({ slug }).lean();
        if (isSlug) {
            fs.unlinkSync(`public/uploads/menu/${fileDto.filename}`);
            throw new createHttpError.Conflict(AdminMessage.MenuSuggestionSlugAlreadyExist);
        }
    }

}

module.exports = AdminService;
