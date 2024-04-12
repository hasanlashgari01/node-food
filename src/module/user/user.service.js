const bcrypt = require("bcrypt");
const createHttpError = require("http-errors");
const UserModel = require("./user.schema");
const RestaurantModel = require("../restaurant/restaurant.schema");
const RestaurantCommentsModel = require("../restaurant/restaurant-comment.schema");
const FoodModel = require("../food/food.schema");
const UserMessage = require("./user.messages");
const { isValidObjectId } = require("mongoose");
const FoodCommentsModel = require("../food/food-comment.schema");
const KindOfFoodModel = require("../food/food-kind.schema");
const CouponModel = require("../coupon/coupon.schema");
const OrderModel = require("../order/order.schema");
const UserAddressModel = require("./user-address.schema");
const RestaurantLikesModel = require("../restaurant/restaurant-likes");
const RestaurantBookmarksModel = require("../restaurant/restaurant-bookmarks");
const FoodLikesModel = require("../food/food-likes");
const FoodBookmarksModel = require("../food/food-bookmarks");

class UserService {
    #model;
    #addressModel;
    #restaurantModel;
    #restaurantCommentsModel;
    #restaurantLikeModel;
    #restaurantBookmarkModel;
    #foodCommentsModel;
    #foodLikeModel;
    #foodBookmarkModel;
    #foodModel;
    #couponModel;
    #orderModel;
    constructor() {
        this.#model = UserModel;
        this.#addressModel = UserAddressModel;
        this.#restaurantModel = RestaurantModel;
        this.#restaurantCommentsModel = RestaurantCommentsModel;
        this.#restaurantLikeModel = RestaurantLikesModel;
        this.#restaurantBookmarkModel = RestaurantBookmarksModel;
        this.#foodCommentsModel = FoodCommentsModel;
        this.#foodLikeModel = FoodLikesModel;
        this.#foodBookmarkModel = FoodBookmarksModel;
        this.#foodModel = FoodModel;
        this.#couponModel = CouponModel;
        this.#orderModel = OrderModel;
    }

    async updateProfile(userId, userDto, fileDto) {
        const { fullName, biography, age, email, mobile, theme, gender } = userDto;
        const updateResult = await this.#model.updateOne(
            { _id: userId },
            {
                fullName,
                avatar: fileDto?.filename,
                biography,
                age: age ? Number(age) : age,
                email,
                mobile,
                gender,
                settings: { theme },
            }
        );
        if (!updateResult.modifiedCount) throw createHttpError.BadRequest(UserMessage.ProfileUpdateSuccess);
    }

    async removeAvatar(userId) {
        const updateResult = await this.#model.updateOne({ _id: userId }, { avatar: "" });
        if (!updateResult.modifiedCount) throw createHttpError.BadRequest(UserMessage.ProfileUpdateSuccess);
    }

    async updatePassword(userId, userDto) {
        const { currentPassword, newPassword } = userDto;

        const user = await this.#model.findById(userId).select("password");
        if (!user) throw createHttpError.NotFound(UserMessage.UserNotExist);
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) throw createHttpError.BadRequest(UserMessage.CurrentPasswordIsWrong);

        const salt = await bcrypt.genSaltSync(10);
        const hashedPassword = await bcrypt.hashSync(newPassword, salt);
        const updateResult = await this.#model.updateOne({ _id: userId }, { password: hashedPassword });
        if (!updateResult.modifiedCount) throw createHttpError.BadRequest(UserMessage.PasswordUpdateFailed);
    }

    async getMe({ _id: userId }) {
        const selectFoodFields = "title image kind";
        const selectRestaurantFields = "name province slug logo cover";

        const userResult = await this.#model
            .findById(userId)
            .select("-otp -cart -__v")
            .populate("likedFoods", selectFoodFields)
            .populate("bookmarkedFoods", selectFoodFields)
            .populate("likedRestaurants", selectRestaurantFields)
            .populate("bookmarkedRestaurants", selectRestaurantFields);
        return { userResult };
    }

    async addCommentForRestaurant(commentDto, userDto) {
        const { body, rate, restaurantId } = commentDto;
        const { _id: userId } = userDto;

        const comment = await this.#restaurantCommentsModel.create({
            body,
            rate,
            restaurantId,
            authorId: userId,
        });
        if (!comment) return createHttpError.BadRequest(UserMessage.CommentFailed);
    }

    async changeRateForRestaurant(commentId, { rate }) {
        const result = await this.#restaurantCommentsModel.updateOne({ _id: commentId }, { rate });
        if (!result.modifiedCount) throw createHttpError.BadRequest(UserMessage.CommentEditedFailed);
    }

    async getWishlist(userDto) {
        const { _id: userId } = userDto;
        const restaurantLikes = await this.#restaurantLikeModel
            .find({ userId })
            .populate("restaurantId", "name slug logo")
            .select("restaurantId")
            .sort({ createdAt: -1 })
            .lean()
            .exec();
        const restaurantBookmarks = await this.#restaurantBookmarkModel
            .find({ userId })
            .populate("restaurantId", "name slug logo")
            .select("restaurantId")
            .sort({ createdAt: -1 })
            .lean()
            .exec();
        const foodLikes = await this.#foodLikeModel
            .find({ userId })
            .populate("foodId", "title image price restaurantId")
            .select("foodId")
            .sort({ createdAt: -1 })
            .lean()
            .exec();
        const foodBookmarks = await this.#foodBookmarkModel
            .find({ userId })
            .populate("foodId", "title image price restaurantId")
            .select("foodId")
            .sort({ createdAt: -1 })
            .lean()
            .exec();

        return {
            restaurantLikes,
            restaurantBookmarks,
            foodLikes,
            foodBookmarks,
        };
    }

    async addCommentForFood(commentDto, userDto) {
        const { body, rate, foodId } = commentDto;
        const { _id: userId } = userDto;

        const comment = await this.#foodCommentsModel.create({
            body,
            rate,
            foodId,
            authorId: userId,
        });
        if (!comment) return createHttpError.BadRequest(UserMessage.CommentFailed);
    }

    async changeRateForFood(commentId, { rate }) {
        const result = await this.#foodCommentsModel.updateOne({ _id: commentId }, { rate });
        if (!result.modifiedCount) throw createHttpError.BadRequest(UserMessage.CommentEditedFailed);
    }

    async likeRestaurant(restaurantDto, userDto) {
        const { id: restaurantId } = restaurantDto;
        const { _id: userId } = userDto;
        const result = await this.#model.updateOne({ _id: userId }, { $push: { likedRestaurants: restaurantId } });
        if (!result.modifiedCount) throw createHttpError.BadRequest(UserMessage.LikeFailed);
    }

    async unlikeRestaurant(restaurantDto, userDto) {
        const { id: restaurantId } = restaurantDto;
        const { _id: userId } = userDto;

        const result = await this.#model.updateOne({ _id: userId }, { $pull: { likedRestaurants: restaurantId } });
        if (!result.modifiedCount) throw createHttpError.BadRequest(UserMessage.UnlikeFailed);
    }

    async bookmarkRestaurant(restaurantDto, userDto) {
        const { id: restaurantId } = restaurantDto;
        const { _id: userId } = userDto;
        const result = await this.#model.updateOne({ _id: userId }, { $push: { bookmarkedRestaurants: restaurantId } });
        if (!result.modifiedCount) throw createHttpError.BadRequest(UserMessage.BookmarkFailed);
    }

    async unbookmarkRestaurant(restaurantDto, userDto) {
        const { id: restaurantId } = restaurantDto;
        const { _id: userId } = userDto;

        const result = await this.#model.updateOne({ _id: userId }, { $pull: { bookmarkedRestaurants: restaurantId } });
        if (!result.modifiedCount) throw createHttpError.BadRequest(UserMessage.BookmarkFailed);
    }

    async likeFood(foodDto, userDto) {
        const { id: restaurantId } = foodDto;
        const { _id: userId } = userDto;
        const result = await this.#model.updateOne({ _id: userId }, { $push: { likedFoods: restaurantId } });
        if (!result.modifiedCount) throw createHttpError.BadRequest(UserMessage.LikeFailed);
    }

    async unlikeFood(foodDto, userDto) {
        const { id: restaurantId } = foodDto;
        const { _id: userId } = userDto;

        const result = await this.#model.updateOne({ _id: userId }, { $pull: { likedFoods: restaurantId } });
        if (!result.modifiedCount) throw createHttpError.BadRequest(UserMessage.UnlikeFailed);
    }

    async bookmarkFood(foodDto, userDto) {
        const { id: restaurantId } = foodDto;
        const { _id: userId } = userDto;
        const result = await this.#model.updateOne({ _id: userId }, { $push: { bookmarkedFoods: restaurantId } });
        if (!result.modifiedCount) throw createHttpError.BadRequest(UserMessage.BookmarkFailed);
    }

    async unbookmarkFood(foodDto, userDto) {
        const { id: restaurantId } = foodDto;
        const { _id: userId } = userDto;

        const result = await this.#model.updateOne({ _id: userId }, { $pull: { bookmarkedFoods: restaurantId } });
        if (!result.modifiedCount) throw createHttpError.BadRequest(UserMessage.BookmarkFailed);
    }

    async addLikeRestaurantComment(commentDto, userDto) {
        const { id: commentId } = commentDto;
        const { _id: userId } = userDto;

        const updateRestaurantLikes = await this.#restaurantCommentsModel.updateOne(
            { _id: commentId },
            { $push: { likes: userId } }
        );
        if (!updateRestaurantLikes.modifiedCount) throw createHttpError.BadRequest(UserMessage.LikeFailed);
    }

    async removeLikeRestaurantComment(commentDto, userDto) {
        const { id: commentId } = commentDto;
        const { _id: userId } = userDto;

        const updateRestaurantLikes = await this.#restaurantCommentsModel.updateOne(
            { _id: commentId },
            { $pull: { likes: userId } }
        );
        if (!updateRestaurantLikes.modifiedCount) throw createHttpError.BadRequest(UserMessage.LikeFailed);
    }

    async addLikeFoodComment(commentDto, userDto) {
        const { id: commentId } = commentDto;
        const { _id: userId } = userDto;

        const updateRestaurantLikes = await this.#foodCommentsModel.updateOne(
            { _id: commentId },
            { $push: { likes: userId } }
        );
        if (!updateRestaurantLikes.modifiedCount) throw createHttpError.BadRequest(UserMessage.LikeFailed);
    }

    async removeLikeFoodComment(commentDto, userDto) {
        const { id: commentId } = commentDto;
        const { _id: userId } = userDto;

        const updateRestaurantLikes = await this.#foodCommentsModel.updateOne(
            { _id: commentId },
            { $pull: { likes: userId } }
        );
        if (!updateRestaurantLikes.modifiedCount) throw createHttpError.BadRequest(UserMessage.LikeFailed);
    }

    async findCommentById(id, model) {
        if (model === "restaurant") {
            const commentRestaurant = await this.#restaurantCommentsModel.findById(id).where({ isAccepted: true });
            if (!commentRestaurant) throw createHttpError.BadRequest(UserMessage.CommentNotExist);
            return commentRestaurant;
        } else if (model === "food") {
            const commentFood = await this.#foodCommentsModel.findById(id).where({ isAccepted: true });
            if (!commentFood) throw createHttpError.BadRequest(UserMessage.CommentNotExist);
            return commentFood;
        }
    }

    async checkExistUser(id) {
        const user = await this.#model.findById(id);
        if (!user) throw createHttpError.NotFound(UserMessage.UserNotExist);
    }

    async checkIsUserCreatedComment(commentDto, userDto) {
        const { _id } = userDto;
        const { authorId } = commentDto;
        if (String(authorId) != String(_id)) throw createHttpError.BadRequest(UserMessage.CommentNotForYou);
    }

    async checkIsLikedRestaurant(restaurantDto, userDto, HttpMethod) {
        const { id: restaurantId } = restaurantDto;
        const { _id: userId } = userDto;

        const result = await this.#model.findOne({ _id: userId, likedRestaurants: restaurantId });
        if (result && HttpMethod === "PATCH") throw createHttpError.BadRequest(UserMessage.RestaurantAlreadyLiked);
        if (!result && HttpMethod === "DELETE") throw createHttpError.BadRequest(UserMessage.RestaurantIsNotList);
    }

    async checkIsBookmarkedRestaurant(restaurantDto, userDto, HttpMethod) {
        const { id: restaurantId } = restaurantDto;
        const { _id: userId } = userDto;

        const result = await this.#model.findOne({ _id: userId, bookmarkedRestaurants: restaurantId });
        if (result && HttpMethod === "PATCH") throw createHttpError.BadRequest(UserMessage.RestaurantAlreadyBookmarked);
        if (!result && HttpMethod === "DELETE") throw createHttpError.BadRequest(UserMessage.RestaurantIsNotList);
    }

    async checkIsLikedFood(foodDto, userDto, HttpMethod) {
        const { id: foodId } = foodDto;
        const { _id: userId } = userDto;

        const result = await this.#model.findOne({ _id: userId, likedFoods: foodId });
        if (result && HttpMethod === "PATCH") throw createHttpError.BadRequest(UserMessage.FoodAlreadyLiked);
        if (!result && HttpMethod === "DELETE") throw createHttpError.BadRequest(UserMessage.FoodIsNotList);
    }

    async checkIsBookmarkedFood(foodDto, userDto, HttpMethod) {
        const { id: foodId } = foodDto;
        const { _id: userId } = userDto;

        const result = await this.#model.findOne({ _id: userId, bookmarkedFoods: foodId });
        if (result && HttpMethod === "PATCH") throw createHttpError.BadRequest(UserMessage.FoodAlreadyBookmarked);
        if (!result && HttpMethod === "DELETE") throw createHttpError.BadRequest(UserMessage.FoodIsNotList);
    }

    async checkExistRestaurant({ id }) {
        if (!isValidObjectId(id)) throw createHttpError.BadRequest(UserMessage.IdNotValid);
        const restaurant = await this.#restaurantModel.findById(id);
        if (!restaurant) throw createHttpError.NotFound(UserMessage.RestaurantNotExist);
        if (!restaurant.isValid) throw createHttpError.ServiceUnavailable(UserMessage.NotValidRestaurant);
    }

    async checkExistFood({ id, foodId }) {
        if (!isValidObjectId(id ?? foodId)) throw createHttpError.BadRequest(UserMessage.IdNotValid);
        const food = await this.#foodModel.findById(id ?? foodId);
        if (!food) throw createHttpError.NotFound(UserMessage.FoodNotExist);
    }

    // * Cart
    async getCart(userDto) {
        const { _id: userId } = userDto;
        const { cart } = await this.#model
            .findById(userId)
            .select("cart")
            .populate("cart.foods.food")
            .populate("cart.coupon");

        return cart;
    }

    async removeFoodFromCart(userDto, foodDto) {
        const { _id: userId } = userDto;
        const { foodId } = foodDto;
        const result = await this.#model.updateOne(
            { _id: userId, "cart.foods._id": foodId },
            { $pull: { "cart.foods": { _id: foodId } } }
        );
        if (!result.modifiedCount) throw createHttpError.BadRequest(UserMessage.RemoveFoodFromCartFailed);
    }

    async incrementCart(userDto, foodDto, { existByFood }) {
        const { _id: userId } = userDto;
        const { foodId } = foodDto;

        let result = null;

        console.log("existByFood => ", existByFood);
        if (existByFood) {
            result = await this.#model.updateOne(
                { _id: userId, "cart.foods._id": foodId },
                { $inc: { "cart.foods.$.quantity": 1 } }
            );
        } else {
            result = await this.#model.updateOne(
                { _id: userId },
                { $push: { "cart.foods": { quantity: 1, food: foodId } } }
            );
        }
        if (!result.modifiedCount) throw createHttpError.BadRequest(UserMessage.IncrementCartFailed);
    }

    async decrementCart(userDto, foodDto, { existById }) {
        const { _id: userId } = userDto;
        const { foodId } = foodDto;

        let result = null;

        if (existById.quantity === 1) {
            result = await this.#model.updateOne({ _id: userId }, { $pull: { "cart.foods": { _id: foodId } } });
        } else {
            result = await this.#model.updateOne(
                { _id: userId, "cart.foods._id": foodId },
                { $inc: { "cart.foods.$.quantity": -1 } }
            );
        }
        if (!result.modifiedCount) throw createHttpError.BadRequest(UserMessage.DecrementCartFailed);
    }

    async checkIsFoodInCart(userDto, foodDto) {
        const { _id: userId } = userDto;
        const { foodId } = foodDto;

        console.log(foodId);

        const { cart } = await this.#model.findById(userId).select("cart.foods");
        let existById = cart.foods.find((food) => food._id.toString() === foodId);
        let existByFood = cart.foods.find((food) => food.food.toString() === foodId);
        console.log(existById, existByFood);

        return { existById, existByFood };
    }

    async emptyCart(userDto) {
        const { _id: userId } = userDto;

        const result = await this.#model.updateOne({ _id: userId }, { $set: { "cart.foods": [] } });
        if (!result.modifiedCount) throw createHttpError.BadRequest(UserMessage.EmptyCartFailed);
    }

    // * Address

    async getAllAddress(userDto) {
        const { _id: userId } = userDto;

        return await this.#addressModel.findOne({ userId: userId }).lean();
    }

    async addAddress(userDto, addressDto) {
        const { _id: userId } = userDto;
        const { province, city, district, detail, coordinate, mobile, title } = addressDto;

        let result = null;
        const existAddress = await this.#addressModel.findOne({ userId });

        if (existAddress) {
            result = await this.#addressModel.updateOne(
                { userId },
                { $push: { address: { province, city, district, detail, coordinate, mobile, title } } }
            );
        } else {
            result = await this.#addressModel.create({
                userId,
                address: { province, city, district, detail, coordinate, mobile, title },
            });
        }
        if (!result) throw createHttpError.BadRequest(UserMessage.AddressAddedFailed);
    }

    async getAddress(userDto, addressDto) {
        const { _id: userId } = userDto;
        const { id: addressId } = addressDto;
        return await this.#addressModel.findOne({ userId, "address._id": addressId }, { "address.$": 1 }).lean();
    }

    async editAddress(userDto, paramsDto, addressDto) {
        const { _id: userId } = userDto;
        const { id: addressId } = paramsDto;
        const { province, city, district, detail, coordinate, mobile, title } = addressDto;

        const result = await this.#addressModel.updateOne(
            { userId, "address._id": addressId },
            { $set: { "address.$": { province, city, district, detail, coordinate, mobile, title } } }
        );

        if (!result.modifiedCount) throw createHttpError.BadRequest(UserMessage.AddressEditFailed);
    }

    async removeAddress(userDto, addressDto) {
        const { _id: userId } = userDto;
        const { id: addressId } = addressDto;

        const result = await this.#addressModel.updateOne({ userId }, { $pull: { address: { _id: addressId } } });

        if (!result.modifiedCount) throw createHttpError.BadRequest(UserMessage.AddressRemoveFailed);
    }

    // * Comments
    async getComments(userDto) {
        const { _id: userId } = userDto;

        const foodComments = await this.#foodCommentsModel.find({ authorId: userId });
        const restaurantComments = await this.#restaurantCommentsModel.find({ authorId: userId });

        return { foodComments, restaurantComments };
    }

    // * Offers
    async getOffers(userDto) {
        const { _id: userId } = userDto;

        const offers = await this.#couponModel
            .find({ userIds: { $in: userId } })
            .select("code amount status startDate expireDate foodIds")
            .populate("foodIds");

        return { offers };
    }

    async getDashboard(userDto) {
        const { _id: userId } = userDto;

        const successOrders = await this.#orderModel.find({ user: userId, status: "COMPLETED" }).countDocuments();
        const failedOrders = await this.#orderModel.find({ user: userId, status: "CANCELED" }).countDocuments();
        const foodComments = await this.#foodCommentsModel
            .find({ authorId: userId, isAccepted: true })
            .countDocuments();
        const restaurantComments = await this.#restaurantCommentsModel
            .find({ authorId: userId, isAccepted: true })
            .countDocuments();

        const countComments = foodComments + restaurantComments;

        return { successOrders, failedOrders, countComments };
    }
}

module.exports = UserService;
