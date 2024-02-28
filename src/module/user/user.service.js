const createHttpError = require("http-errors");
const UserModel = require("./user.schema");
const RestaurantModel = require("../restaurant/restaurant.schema");
const RestaurantCommentsModel = require("../restaurant/restaurant-comment.schema");
const FoodModel = require("../food/food.schema");
const UserMessage = require("./user.messages");
const { isValidObjectId } = require("mongoose");

class UserService {
    #model;
    #restaurantModel;
    #restaurantCommentModel;
    #foodModel;
    constructor() {
        this.#model = UserModel;
        this.#restaurantModel = RestaurantModel;
        this.#restaurantCommentModel = RestaurantCommentsModel;
        this.#foodModel = FoodModel;
    }

    async addCommentForRestaurant(commentDto, userDto) {
        const { body, rate, restaurantId } = commentDto;
        const { _id } = userDto;

        const comment = await this.#restaurantCommentModel.create({
            body,
            rate,
            restaurantId,
            authorId: _id,
        });
        if (!comment) return createHttpError.BadRequest(UserMessage.CommentCreated);
    }

    async changeRateForRestaurant(commentId, { rate }) {
        const result = await this.#restaurantCommentModel.updateOne({ _id: commentId }, { rate });
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

    async findCommentById(id) {
        const comment = await this.#restaurantCommentModel.findById(id);
        if (!comment) throw createHttpError.BadRequest(UserMessage.CommentNotExist);

        return comment;
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
        if (result && HttpMethod === "PATCH") throw createHttpError.BadRequest(UserMessage.RestaurantAlreadyBookmarked);
        if (!result && HttpMethod === "DELETE") throw createHttpError.BadRequest(UserMessage.RestaurantIsNotList);
    }

    async checkExistRestaurant({ id }) {
        if (!isValidObjectId(id)) throw createHttpError.BadRequest(UserMessage.IdNotValid);
        const restaurant = await this.#restaurantModel.findById(id);
        if (!restaurant) throw createHttpError.NotFound(UserMessage.RestaurantNotExist);
        if (!restaurant.isValid) throw createHttpError.ServiceUnavailable(UserMessage.NotValidRestaurant);
    }

    async checkExistFood({ id }) {
        if (!isValidObjectId(id)) throw createHttpError.BadRequest(UserMessage.IdNotValid);
        const food = await this.#foodModel.findById(id);
        if (!food) throw createHttpError.NotFound(UserMessage.FoodNotExist);
    }
}

module.exports = UserService;
