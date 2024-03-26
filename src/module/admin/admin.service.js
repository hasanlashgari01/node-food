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
const RestaurantCommentsModel = require("../restaurant/restaurant-comment.schema");
const FoodCommentsModel = require("../food/food-comment.schema");
const OrderModel = require("../order/order.schema");
const { todayOption, yesterdayOption, monthlyOption, thisWeekOption } = require("../../common/utils/options");

class AdminService {
    #model;
    #restaurantModel;
    #restaurantCommentModel;
    #foodCommentModel;
    #banRestaurantModel;
    #suggestionMenuModel;
    #banUserModel;
    #orderModel;

    constructor() {
        autoBind(this);
        this.#model = UserModel;
        this.#restaurantModel = RestaurantModel;
        this.#restaurantCommentModel = RestaurantCommentsModel;
        this.#foodCommentModel = FoodCommentsModel;
        this.#banRestaurantModel = BanRestaurantModel;
        this.#suggestionMenuModel = SuggestionMenuModel;
        this.#banUserModel = BanUserModel;
        this.#orderModel = OrderModel;
    }

    async allRestaurant() {
        const restaurantCount = await this.#restaurantModel.find().count();
        const restaurants = await this.#restaurantModel.find().lean();

        return { restaurantCount, restaurants };
    }

    async allRestaurantBanned() {
        const restaurantBannedCount = await this.#banRestaurantModel.find().count();
        let restaurantsBanned = await this.#banRestaurantModel
            .find()
            .select("-__v")
            .populate("restaurantId", "name phone email province category")
            .lean();

        restaurantsBanned = restaurantsBanned.map((item) => {
            let restaurant = item.restaurantId;
            return { ...restaurant };
        });

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

    async banRestaurant(id, isBan) {
        let banResult = null;
        if (isBan) {
            banResult = await this.#banRestaurantModel.deleteOne({ restaurantId: id });
            if (!banResult.deletedCount) throw createHttpError.BadRequest(AdminMessage.RestaurantUnBanFailed);
        } else {
            banResult = await this.#banRestaurantModel.create({ restaurantId: id });
            if (!banResult) throw createHttpError.BadRequest(AdminMessage.RestaurantBanFailed);
        }
        return banResult;
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

    async checkIsBanRestaurant(id, showError = true) {
        const isBanRestauRent = await this.#banRestaurantModel.findOne({ restaurantId: id });
        if (showError && isBanRestauRent) throw new createHttpError.NotFound(RestaurentMessage.RestaurantBanned);
        return isBanRestauRent;
    }

    async checkIsNotBanRestaurant(id) {
        const isBanRestauRent = await this.#banRestaurantModel.findOne({ restaurantId: id });
        if (!isBanRestauRent) throw new createHttpError.NotFound(AdminMessage.RestaurantIsNotBanned);
    }

    // * Menu
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

    // * User
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
            banResult = await this.#banUserModel.deleteOne({ mobile });
            if (!banResult.deletedCount) throw createHttpError.BadRequest(AdminMessage.UserUnBanFailed);
        } else {
            banResult = await this.#banUserModel.create({ mobile });
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

    async checkIsUserOnBanList(mobile, email, showError = false) {
        const isMobileUser = await this.#banUserModel.findOne({ mobile });
        let isEmailUser;
        if (email) {
            isEmailUser = await this.#banUserModel.findOne({ email });
        }
        if (showError) {
            if (isMobileUser || isEmailUser) {
                throw new createHttpError.BadRequest(AdminMessage.UserAlreadyOnBanList);
            }
        }
        return isMobileUser ?? isEmailUser;
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

    async changeRoleAsAdmin() {}

    // * Comment
    async getRestaurantComments() {
        const restaurantComments = await this.#restaurantCommentModel
            .find()
            .populate("restaurantId", "name phone email slug")
            .populate("authorId", "fullName mobile email")
            .lean();

        return restaurantComments;
    }

    async rejectRestaurantComment(commentId) {
        const { authorId } = await this.#restaurantCommentModel
            .findByIdAndUpdate(commentId, { isAccepted: false })
            .select("authorId")
            .populate("authorId")
            .lean();

        return authorId;
    }

    async getFoodComments() {
        const foodComments = await this.#foodCommentModel
            .find()
            .populate("foodId", "title image rate")
            .populate("authorId", "fullName mobile email")
            .lean();

        return foodComments;
    }

    async rejectFoodComment(commentId) {
        const { authorId } = await this.#foodCommentModel
            .findByIdAndUpdate(commentId, { isAccepted: false })
            .select("authorId")
            .populate("authorId")
            .lean();

        return authorId;
    }

    async changeCommentFoodToShowOrHide(commentId, status) {}

    async getDashboardData() {
        const users = await this.getUsersDetails();
        const comments = await this.getCommentsDetails();
        const restaurants = await this.getRestaurantsDetails();
        const orders = await this.getOrders();

        return { users, comments, restaurants, orders };
    }

    async getUsersDetails() {
        const userCount = await this.#model.countDocuments();
        const todayCount = await this.#model.countDocuments(todayOption);
        const yesterdayCount = await this.#model.countDocuments(yesterdayOption);
        const thisWeekCount = await this.#model.countDocuments(thisWeekOption);
        const bannedUsersCount = await this.#banUserModel.countDocuments();
        const genderCount = await this.#model.aggregate([
            { $group: { _id: "$gender", count: { $sum: 1 }, gender: { $first: "$gender" } } },
            { $sort: { _id: 1 } },
            {
                $project: {
                    _id: 0,
                    gender: "$_id",
                    count: 1,
                    percentage: { $round: [{ $multiply: [{ $divide: ["$count", userCount] }, 100] }, 2] },
                },
            },
        ]);

        return { userCount, todayCount, yesterdayCount, thisWeekCount, bannedUsersCount, genderCount };
    }

    async getCommentsDetails() {
        const restaurantCount = await this.#restaurantCommentModel.countDocuments();
        const restaurantTodayCount = await this.#restaurantCommentModel.countDocuments(todayOption);
        const restaurantYesterdayCount = await this.#restaurantCommentModel.countDocuments(yesterdayOption);
        const restaurantMonthlyCount = await this.#restaurantCommentModel.aggregate(monthlyOption);

        const foodCount = await this.#foodCommentModel.countDocuments();
        const foodTodayCount = await this.#foodCommentModel.countDocuments(todayOption);
        const foodYesterdayCount = await this.#foodCommentModel.countDocuments(yesterdayOption);
        const foodMonthlyCount = await this.#foodCommentModel.aggregate(monthlyOption);

        return {
            commentCount: restaurantCount + foodCount,
            todayCount: restaurantTodayCount + foodTodayCount,
            yesterdayCount: restaurantYesterdayCount + foodYesterdayCount,
            restaurantMonthlyCount,
            foodMonthlyCount,
        };
    }

    async getRestaurantsDetails() {
        const restaurantCount = await this.#restaurantModel.countDocuments();
        const activeRestaurantCount = await this.#restaurantModel.countDocuments({ isValid: true });
        const notActiveRestaurantCount = await this.#restaurantModel.countDocuments({ isValid: false });
        const bannedRestaurantsCount = await this.#banRestaurantModel.countDocuments();
        const monthlyRestaurantsCount = await this.#restaurantModel.aggregate(monthlyOption);

        return {
            restaurantCount,
            activeRestaurantCount,
            notActiveRestaurantCount,
            bannedRestaurantsCount,
            monthlyRestaurantsCount,
        };
    }

    async getOrders() {
        const ordersCount = await this.#orderModel.countDocuments();
        const ordersPendingCount = await this.#orderModel.countDocuments({ status: "PENDING" });
        const ordersCompletedCount = await this.#orderModel.countDocuments({ status: "COMPLETED" });
        const ordersCanceledCount = await this.#orderModel.countDocuments({ status: "CANCELED" });
        const monthlyCount = await this.#orderModel.aggregate(monthlyOption);

        return { ordersCount, ordersPendingCount, ordersCompletedCount, ordersCanceledCount, monthlyCount };
    }
}

module.exports = AdminService;
