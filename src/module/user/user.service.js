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
}

module.exports = UserService;
