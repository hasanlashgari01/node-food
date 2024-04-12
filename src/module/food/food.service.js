const createHttpError = require("http-errors");
const { isValidObjectId } = require("mongoose");
const FoodModel = require("./food.schema");
const RestaurantModel = require("../restaurant/restaurant.schema");
const MenuModel = require("../menu/menu.schema");
const FoodMessage = require("./food.messages");
const MenuMessage = require("../menu/menu.messages");
const RestaurantMessage = require("../restaurant/restaurant.messages");
const KindOfFoodModel = require("./food-kind.schema");
const FoodCommentsModel = require("./food-comment.schema");
const RestaurantCommentsModel = require("../restaurant/restaurant-comment.schema");
const FoodLikesModel = require("./food-likes");
const FoodBookmarksModel = require("./food-bookmarks");

class FoodService {
    #model;
    #kindOfFoodModel;
    #foodCommentsModel;
    #foodLikeModel;
    #foodBookmarkModel;
    #restaurantCommentsModel;
    #restaurantModel;
    #menuModel;
    constructor() {
        this.#model = FoodModel;
        this.#kindOfFoodModel = KindOfFoodModel;
        this.#foodCommentsModel = FoodCommentsModel;
        this.#foodLikeModel = FoodLikesModel;
        this.#foodBookmarkModel = FoodBookmarksModel;
        this.#restaurantCommentsModel = RestaurantCommentsModel;
        this.#restaurantModel = RestaurantModel;
        this.#menuModel = MenuModel;
    }

    async toggleLike(paramsDto, userDto) {
        const { id: foodId } = paramsDto;
        const { _id: userId } = userDto;
        const isLiked = !!(await this.#foodLikeModel.findOne({ foodId, userId }));
        let message = null;
        if (!isLiked) {
            await this.#foodLikeModel.create({ foodId, userId });
            message = FoodMessage.Liked;
        } else {
            await this.#foodLikeModel.deleteOne({ foodId, userId });
            message = FoodMessage.Unliked;
        }

        return { message };
    }

    async toggleBookmark(paramsDto, userDto) {
        const { id: foodId } = paramsDto;
        const { _id: userId } = userDto;
        const isBookmarked = !!(await this.#foodBookmarkModel.findOne({ foodId, userId }));
        let message = null;
        if (!isBookmarked) {
            await this.#foodBookmarkModel.create({ foodId, userId });
            message = FoodMessage.Bookmarked;
        } else {
            await this.#foodBookmarkModel.deleteOne({ foodId, userId });
            message = FoodMessage.Unbookmarked;
        }

        return { message };
    }

    async create(foodDto, userDto, fileDto) {
        const { title, description, menuId, price, weight, percent, startDate, endDate, amount, restaurantId } =
            foodDto;
        await this.isValidRestaurant(restaurantId);
        const menu = await this.isValidMenu(menuId);
        await this.isAdmin(menu, userDto);
        const resultCreateFood = await this.#model.create({
            title,
            image: fileDto?.filename || null,
            description,
            menuId,
            price,
            weight,
            discount: { percent, startDate, endDate, amount },
            restaurantId,
        });
        if (!resultCreateFood) throw new createHttpError.InternalServerError(FoodMessage.CreateFailed);
        const resultPushMenuID = await this.#menuModel.updateOne(
            { _id: menuId },
            { $push: { foods: resultCreateFood._id } }
        );
        if (resultPushMenuID.modifiedCount === 0) throw createHttpError.BadRequest(MenuMessage.CreatedFailed);
    }

    async getOne(id) {
        const result = await this.#model.findById(id);
        if (!result) throw new createHttpError.NotFound(FoodMessage.NotExist);
        return result;
    }

    async update(id, foodDto, fileDto) {
        const { title, description, menuId, price, weight, percent, startDate, endDate, amount } = foodDto;

        const resultCreateFood = await this.#model.updateOne(
            { _id: id },
            {
                title,
                image: fileDto?.filename ?? null,
                description,
                menuId,
                price,
                weight,
                discount: { percent, startDate, endDate, amount },
            }
        );
        if (!resultCreateFood) throw new createHttpError.InternalServerError(FoodMessage.EditFailed);
        await this.#menuModel.updateOne({ foods: id }, { $pull: { foods: id } });
        const resultPushMenuID = await this.#menuModel.updateOne({ _id: menuId }, { $push: { foods: id } });
        if (resultPushMenuID.modifiedCount === 0) throw createHttpError.BadRequest(MenuMessage.EditFailed);
    }

    async delete(id, userDto) {
        const result = await this.#model.findByIdAndDelete(id);
        if (result.deletedCount === 0) throw new createHttpError.NotFound(RestaurantMessage.NotExist);
    }

    async deleteKind(id, userDto) {
        const iskindOfFood = await this.isValidKindFood(id);
        const { menuId } = await this.isValidFoodByKindID(iskindOfFood._id);
        await this.isAdmin(menuId, userDto);
        const resultPopKindOfFoodID = await this.#kindOfFoodModel.updateOne(
            { _id: iskindOfFood._id },
            { $pull: { foods: { _id: id } } }
        );
        if (resultPopKindOfFoodID.modifiedCount === 0) throw createHttpError.BadRequest(MenuMessage.DeleteFailed);
    }

    async deleteKindMany(id, kindsId, userDto) {
        const resultPopKindOfFoodID = await this.#kindOfFoodModel.updateMany(
            { _id: id },
            { $pull: { foods: { _id: kindsId } } }
        );
        if (resultPopKindOfFoodID.modifiedCount === 0) throw createHttpError.BadRequest(FoodMessage.NotExist);
    }

    async isValidRestaurant(id) {
        if (!isValidObjectId(id)) throw new createHttpError.BadRequest(RestaurentMessage.IdNotValid);
        const restaurant = await this.#restaurantModel.findById(id);
        if (!restaurant) throw new createHttpError.NotFound(RestaurentMessage.NotExist);
        if (!restaurant.isValid) throw createHttpError.ServiceUnavailable(RestaurentMessage.NotValidRestaurant);
        return restaurant;
    }

    async isValidMenu(id) {
        if (!isValidObjectId(id)) throw new createHttpError.BadRequest(MenuMessage.IdNotValid);
        const menu = await this.#menuModel.findById(id);
        if (!menu) throw new createHttpError.NotFound(MenuMessage.NotExist);
        return menu;
    }

    async isValidFood(id) {
        if (!isValidObjectId(id)) throw new createHttpError.BadRequest(FoodMessage.IdNotValid);
        const food = await this.#model.findById(id);
        if (!food) throw new createHttpError.NotFound(FoodMessage.NotExist);
        return food;
    }

    async isValidFoodByKindID(id) {
        if (!isValidObjectId(id)) throw new createHttpError.BadRequest(FoodMessage.IdNotValid);
        const food = await this.#model.findOne({ kindId: id }).populate("menuId");
        if (!food) throw new createHttpError.NotFound(FoodMessage.NotExist);
        return food;
    }

    async isValidKindFood(id) {
        if (!isValidObjectId(id)) throw new createHttpError.BadRequest(FoodMessage.IdNotValid);
        const food = await this.#kindOfFoodModel.findOne({ "foods._id": id });
        if (!food) throw new createHttpError.NotFound(FoodMessage.NotExist);
        return food;
    }

    async isAdmin({ restaurantId }, { restaurants }) {
        const isAdmin = restaurants.some((id) => id.toString() === restaurantId.toString());
        if (!isAdmin) throw createHttpError.BadRequest(RestaurantMessage.NotAdmin);
        return isAdmin;
    }

    async getAllComments(id) {
        const comments = await this.#foodCommentsModel
            .find({ foodId: id }, "-__v")
            .populate("authorId", "fullName mobile");

        return { comments };
    }

    async changeRestaurantCommentStatus(commentDto) {
        const { _id: commentId, isAccepted } = commentDto;

        const updateResult = await this.#restaurantCommentsModel.updateOne(
            { _id: commentId },
            { isAccepted: !isAccepted }
        );
        if (!updateResult.modifiedCount) throw createHttpError.BadRequest(FoodMessage.CommentUpdateFailed);
    }

    async changeCommentStatus(commentDto) {
        const { _id: commentId, isAccepted } = commentDto;

        const updateResult = await this.#foodCommentsModel.updateOne({ _id: commentId }, { isAccepted: !isAccepted });
        if (!updateResult.modifiedCount) throw createHttpError.BadRequest(FoodMessage.CommentUpdateFailed);
    }

    async checkExistComment(commentId, isFood = true) {
        let comment = null;
        if (isFood) {
            comment = await this.#foodCommentsModel.findById(commentId);
        } else {
            comment = await this.#restaurantCommentsModel.findById(commentId);
        }
        if (!comment) throw createHttpError.NotFound(FoodMessage.CommentNotExist);
        return { comment };
    }
}

module.exports = FoodService;
