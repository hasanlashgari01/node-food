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
const BanUserModel = require("./../ban/ban.schema");

class AdminService {
    #model;
    #restaurantModel;
    #banRestaurantModel;
    #suggestionMenuModel;
    #banUserModel;

    constructor() {
        autoBind(this);
        this.#model = UserModel;
        this.#restaurantModel = RestaurantModel;
        this.#banRestaurantModel = BanRestaurantModel;
        this.#suggestionMenuModel = SuggestionMenuModel;
        this.#banUserModel = BanUserModel;
    }

    async allRestaurant() {
        const restaurantCount = await this.#restaurantModel.find().count();
        const restaurants = await this.#restaurantModel.find().lean();

        return { restaurantCount, restaurants };
    }

    async allRestaurantBanned() {
        const restaurantBannedCount = await this.#banRestaurantModel.find().count();
        const restaurantsBanned = await this.#banRestaurantModel
            .find()
            .select("-__v")
            .populate("restaurantId", "name phone email province category")
            .lean();
        console.log(restaurantsBanned);

        return { restaurantBannedCount, restaurantsBanned };
    }

    async allRestaurantWithStatus(isValid) {
        console.log(isValid);
        const restaurantCount = await this.#restaurantModel.find({ isValid }).count();
        const restaurants = await this.#restaurantModel.find({ isValid }).lean();
        console.log(restaurants);

        return { restaurantCount, restaurants };
    }

    async acceptOrRejectRestaurant(id, isValid) {
        const updateResult = await this.#restaurantModel.updateOne({ _id: id }, { isValid: !isValid });
        if (!updateResult.modifiedCount)
            throw createHttpError.BadRequest(
                isValid ? AdminMessage.RestaurantRejectFailed : AdminMessage.RestaurantRejectSuccess
            );
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
        const restaurant = await this.checkIsValidRestaurant(id);
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

    async allUsersByRole(role) {
        const optionsUsersRole = { role };
        const optionsUsersUnselect = { password: 0, otp: 0, resetLink: 0, __v: 0 };
        const resultCount = await this.#model.find({ ...optionsUsersRole }).count();
        const result = await this.#model.find({ ...optionsUsersRole }, { ...optionsUsersUnselect }).lean();

        return { resultCount, result };
    }

    async banUserByAdmin(mobile, email, isBanUser) {
        let banResult;
        if (isBanUser) {
            banResult = await this.#banUserModel.deleteOne({ mobile, email });
            if (!banResult.deletedCount) throw createHttpError.BadRequest(AdminMessage.UserUnBanFailed);
        } else {
            banResult = await this.#banUserModel.create({ mobile, email });
            if (!banResult) throw createHttpError.BadRequest(AdminMessage.UserBanFailed);
        }
        return banResult;
    }

    async checkIsValidUser(id) {
        if (!isValidObjectId(id)) throw new createHttpError.BadRequest(AdminMessage.IdNotValid);
        const user = await this.#model.findById(id);
        if (!user) throw new createHttpError.NotFound(AdminMessage.UserNotExist);
        return user;
    }

    async checkIsUserOnBanList(mobile, email) {
        const isBanUser = await this.#banUserModel.findOne({ $or: [{ mobile }, { email }] });
        return isBanUser;
    }

    async userBanListGuard(userDto) {
        if (userDto) throw new createHttpError.BadRequest(AdminMessage.UserAlreadyOnBanList);
    }

    async getUsersByRole(role) {
        const roles = ["ADMIN", "SELLER", "USER"];
        if (!roles.includes(role.toUpperCase())) throw new createHttpError.BadRequest(AdminMessage.UserNotExist);

        console.log(role);
        const result = await this.#model.find({ role: role.toUpperCase() });
        return { result };
    }

    async getUsersBanned() {
        const result = await this.#banUserModel.find();
        return { result };
    }

    async changeRoleAsSeller(id) {
        const result = await this.#model.updateOne({ _id: id }, { requestSeller: 1, role: "SELLER" });
        if (!result.modifiedCount) throw new createHttpError.BadRequest(AdminMessage.UserChangeRoleFailed);
    }

    async changeRoleAsAdmin() {
        
    }
}

module.exports = AdminService;
