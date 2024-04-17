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
const FoodCommentLikesModel = require("./comment-likes.schema");

class FoodService {
    #model;
    #kindOfFoodModel;
    #foodCommentsModel;
    #foodCommentLikeModel;
    #foodLikeModel;
    #foodBookmarkModel;
    #restaurantCommentsModel;
    #restaurantModel;
    #menuModel;
    constructor() {
        this.#model = FoodModel;
        this.#kindOfFoodModel = KindOfFoodModel;
        this.#foodCommentsModel = FoodCommentsModel;
        this.#foodCommentLikeModel = FoodCommentLikesModel;
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

    async getOne(id, userDto) {
        const userId = userDto?._id;
        let isLiked = false;
        let isBookmarked = false;

        const food = await this.#model.findById(id).populate("menuId", "title slug restaurantId");
        if (!food) throw new createHttpError.NotFound(FoodMessage.NotExist);
        await this.calculateRateAndSave(food._id);

        if (Boolean(userId)) {
            isLiked = !!(await this.#foodLikeModel.findOne({ foodId: id, userId }));
            isBookmarked = !!(await this.#foodBookmarkModel.findOne({ foodId: id, userId }));
        }

        const foodData = { ...food._doc, isLiked, isBookmarked };

        return foodData;
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
                discount: {
                    percent: percent ? percent : 0,
                    startDate: startDate ? startDate : null,
                    endDate: endDate ? endDate : null,
                    amount,
                },
            }
        );
        console.log("🚀 ~ FoodService ~ update ~ resultCreateFood:", resultCreateFood);
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

    async getCommentById(paramsDto) {
        const { id: commentId } = paramsDto;

        const comment = await this.#foodCommentsModel.findById(commentId).populate("authorId", "fullName avatar");
        if (!comment) throw createHttpError.NotFound(FoodMessage.CommentNotExist);

        return comment;
    }

    async getAllComments(id) {
        const comments = await this.#foodCommentsModel
            .find({ foodId: id }, "-__v")
            .populate("authorId", "fullName mobile");

        return { comments };
    }

    async createComment(commentDto) {
        const { body, rate, foodId, authorId } = commentDto;

        const comment = await this.#foodCommentsModel.create({
            body,
            rate,
            authorId,
            foodId,
        });
        if (!comment) throw createHttpError.BadRequest(FoodMessage.CommentCreatedFailed);
    }

    async getComments(id, userDto, queryDto) {
        const userId = userDto?._id;
        const { page = 1, limit = 5 } = queryDto;

        const count = await this.#foodCommentsModel.countDocuments({ foodId: id, isAccepted: true });
        const comments = await this.#foodCommentsModel
            .find({ foodId: id, isAccepted: true }, "-__v")
            .populate("authorId", "fullName avatar")
            .sort({ createdAt: -1 })
            .limit(limit)
            .skip(page > 0 ? (page - 1) * limit : 0)
            .lean();

        if (Boolean(userId)) {
            for (const comment of comments) {
                comment.likes = await this.#foodCommentLikeModel
                    .find({ commentId: comment._id, userId })
                    .countDocuments()
                    .lean();
                comment.isLiked = !!(await this.#foodCommentLikeModel.findOne({
                    commentId: comment._id,
                    userId,
                }));
            }
        } else {
            for (const comment of comments) {
                comment.likes = await this.#foodCommentLikeModel
                    .find({ commentId: comment._id })
                    .countDocuments()
                    .lean();
            }
        }

        return { count, comments };
    }

    async toggleLikeComment(commentDto, userDto) {
        const { id: commentId } = commentDto;
        const { _id: userId } = userDto;

        const isLiked = !!(await this.#foodCommentLikeModel.findOne({ commentId, userId }));

        let message = null;
        if (isLiked) {
            await this.#foodCommentLikeModel.deleteOne({ commentId, userId });
            message = FoodMessage.Unliked;
        } else {
            await this.#foodCommentLikeModel.create({ commentId, userId });
            message = FoodMessage.Liked;
        }
        return { message };
    }

    async getSuggestionSimilar(id) {
        const menuId = await this.recursiveMenuId(id);

        const similarFoods = await this.#model
            .find({ menuId, _id: { $ne: id } }, "-__v -kindId -description")
            .limit(6)
            .lean();
        return similarFoods;
    }

    async getSuggestionPopular(id) {
        const restaurantId = await this.recursiveRestaurantId(id);

        const popularFoods = await this.#model
            .find(
                {
                    restaurantId,
                    rate: { $gte: 3 },
                    price: { $gte: 0 },
                    _id: { $ne: id },
                },
                "-__v -kindId -description"
            )
            .populate("menuId", "title slug")
            .limit(6)
            .lean();

        return popularFoods;
    }

    async getSuggestionDiscount(id) {
        const restaurantId = await this.recursiveRestaurantId(id);

        const discountFoods = await this.#model
            .find(
                {
                    restaurantId,
                    price: { $gte: 0 },
                    "discount.percent": { $gt: 0 },
                    _id: { $ne: id },
                },
                "-__v -kindId -description"
            )
            .populate("menuId", "title slug")
            .limit(6)
            .lean();

        return discountFoods;
    }

    async getNews(id) {
        const restaurantId = await this.recursiveRestaurantId(id);

        const newFoods = await this.#model
            .find({ restaurantId, _id: { $ne: id } }, "-__v -kindId -description")
            .populate("menuId", "title slug")
            .sort({ createdAt: -1 })
            .limit(6)
            .lean();

        return newFoods;
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

    async recursiveRestaurantId(id) {
        if (!isValidObjectId(id)) throw createHttpError.NotFound(FoodMessage.NotExist);
        const food = await this.#model.findOne({ _id: id }).select("restaurantId");
        if (!Boolean(food)) throw createHttpError.NotFound(FoodMessage.NotFound);

        return food.restaurantId;
    }

    async recursiveMenuId(id) {
        if (!isValidObjectId(id)) throw createHttpError.NotFound(FoodMessage.NotExist);
        const food = await this.#model.findOne({ _id: id }).select("menuId");
        if (!Boolean(food)) throw createHttpError.NotFound(FoodMessage.NotFound);

        return food.menuId;
    }

    async calculateRateAndSave(id) {
        const commentsCount = await this.#foodCommentsModel.countDocuments({
            foodId: id,
            isAccepted: true,
        });
        const commentsRate = await this.#foodCommentsModel.find({ foodId: id, isAccepted: true }).select("rate");
        const calculateRate = commentsRate.reduce((a, b) => a + b.rate, 0) / commentsCount;
        const rate = calculateRate.toFixed(2);

        const result = await this.#model.updateOne({ _id: id }, { rate: isNaN(rate) ? 0 : rate });
    }
}

module.exports = FoodService;
