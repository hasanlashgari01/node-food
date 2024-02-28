const createHttpError = require("http-errors");
const UserModel = require("./user.schema");
const RestaurantCommentsModel = require("../restaurant/restaurant-comment.schema");
const UserMessage = require("./user.messages");

class UserService {
    #model;
    #restaurantCommentModel;
    constructor() {
        this.#model = UserModel;
        this.#restaurantCommentModel = RestaurantCommentsModel;
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
}

module.exports = UserService;
