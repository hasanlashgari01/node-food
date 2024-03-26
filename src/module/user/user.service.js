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

class UserService {
    #model;
    #restaurantModel;
    #restaurantCommentsModel;
    #foodCommentsModel;
    #foodModel;
    #kindFoodModel;
    constructor() {
        this.#model = UserModel;
        this.#restaurantModel = RestaurantModel;
        this.#restaurantCommentsModel = RestaurantCommentsModel;
        this.#foodCommentsModel = FoodCommentsModel;
        this.#foodModel = FoodModel;
        this.#kindFoodModel = KindOfFoodModel;
    }

    async updateProfile(userId, userDto, fileDto) {
        const { fullName, biography, age, email, mobile, theme, gender } = userDto;
        console.log(age);
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
            .select("-otp -__v")
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

    async checkExistKindFood({ id, foodId }) {
        if (!isValidObjectId(id ?? foodId)) throw createHttpError.BadRequest(UserMessage.IdNotValid);
        const food = await this.#kindFoodModel.findById(id ?? foodId);
        if (!food) throw createHttpError.NotFound(UserMessage.FoodNotExist);
    }

    // * Cart
    async incrementCart(userDto, foodDto, resultExistFood) {
        const { _id: userId } = userDto;
        const { foodId } = foodDto;

        let result = null;

        if (resultExistFood) {
            result = await this.#model.updateOne(
                { _id: userId, "cart.foods.foodId": foodId },
                { $inc: { "cart.foods.$.quantity": 1 } }
            );
        } else {
            result = await this.#model.updateOne({ _id: userId }, { $push: { "cart.foods": { quantity: 1, foodId } } });
        }
        if (!result.modifiedCount) throw createHttpError.BadRequest(UserMessage.IncrementCartFailed);
    }

    async decrementCart(userDto, foodDto, resultExistFood) {
        const { _id: userId } = userDto;
        const { foodId } = foodDto;

        if (!resultExistFood) throw createHttpError.BadRequest(UserMessage.FoodNotExist);

        let result = null;

        if (resultExistFood.quantity === 1) {
            result = await this.#model.updateOne({ _id: userId }, { $pull: { "cart.foods": { foodId } } });
        } else {
            result = await this.#model.updateOne(
                { _id: userId, "cart.foods.foodId": foodId },
                { $inc: { "cart.foods.$.quantity": -1 } }
            );
        }
        if (!result.modifiedCount) throw createHttpError.BadRequest(UserMessage.DecrementCartFailed);
    }

    async checkIsFoodInCart(userDto, foodDto) {
        const { _id: userId } = userDto;
        const { foodId } = foodDto;
        if (!isValidObjectId(userId)) throw createHttpError.BadRequest(UserMessage.IdNotValid);

        const {
            cart: { foods },
        } = await this.#model.findOne({ $and: [{ _id: userId }] }).select("cart");
        const result = foods?.find((food) => food?.foodId?.toString() === foodId);

        return result;
    }

    async emptyCart(userDto) {
        const { _id: userId } = userDto;

        const result = await this.#model.updateOne({ _id: userId }, { $set: { "cart.foods": [] } });
        if (!result.modifiedCount) throw createHttpError.BadRequest(UserMessage.EmptyCartFailed);
    }
}

module.exports = UserService;
