const createHttpError = require("http-errors");
const { isValidObjectId } = require("mongoose");
const translatte = require("translatte");
const slugify = require("slugify");
const RestaurantModel = require("./restaurant.schema");
const RestaurantCommentsModel = require("./restaurant-comment.schema");
const RestaurantMessage = require("./restaurant.messages");
const MenuModel = require("../menu/menu.schema");
const FoodModel = require("../food/food.schema");
const UserModel = require("../user/user.schema");
const KindOfFoodModel = require("../food/food-kind.schema");
const { randomId } = require("../../common/utils/func");
const RestaurantLikesModel = require("./restaurant-likes");
const RestaurantBookmarksModel = require("./restaurant-bookmarks");

class RestaurantService {
    #model;
    #restaurantCommentsModel;
    #restaurantLikeModel;
    #restaurantBookmarkModel;
    #menuModel;
    #foodModel;
    #userModel;
    #kindOfFoodModel;

    constructor() {
        this.#model = RestaurantModel;
        this.#restaurantCommentsModel = RestaurantCommentsModel;
        this.#restaurantLikeModel = RestaurantLikesModel;
        this.#restaurantBookmarkModel = RestaurantBookmarksModel;
        this.#menuModel = MenuModel;
        this.#foodModel = FoodModel;
        this.#userModel = UserModel;
        this.#kindOfFoodModel = KindOfFoodModel;
    }

    async create(restaurantDto, userDto) {
        const { name, order_start, order_end, average_delivery_time } = restaurantDto;

        const resultCreateRestaurant = await this.#model.create({
            ...restaurantDto,
            author: userDto._id,
        });
        if (!resultCreateRestaurant) throw new createHttpError.InternalServerError(RestaurantMessage.CreateFailed);
        const resultPushRestaurantID = await this.#userModel.updateOne(
            { _id: userDto._id },
            { $push: { restaurants: resultCreateRestaurant._id } }
        );
        if (resultPushRestaurantID.modifiedCount === 0)
            throw createHttpError.BadRequest(RestaurantMessage.CreatedFailed);
    }

    async getOne(id) {
        const restaurant = await this.isValidRestaurant(id);
        const menu = await this.#menuModel.find({ restaurantId: restaurant._id }, "-__v").populate("foods", "-__v");

        return { restaurant, menu };
    }

    async toggleLike(paramsDto, userDto) {
        const { id: restaurantId } = paramsDto;
        const { _id: userId } = userDto;
        const isLiked = !!(await this.#restaurantLikeModel.findOne({ restaurantId, userId }));
        let message = null;
        if (!isLiked) {
            await this.#restaurantLikeModel.create({ restaurantId, userId });
            message = RestaurantMessage.Liked;
        } else {
            await this.#restaurantLikeModel.deleteOne({ restaurantId, userId });
            message = RestaurantMessage.Unliked;
        }

        return { message };
    }

    async toggleBookmark(paramsDto, userDto) {
        const { id: restaurantId } = paramsDto;
        const { _id: userId } = userDto;
        const isBookmarked = !!(await this.#restaurantBookmarkModel.findOne({ restaurantId, userId }));
        let message = null;
        if (!isBookmarked) {
            await this.#restaurantBookmarkModel.create({ restaurantId, userId });
            message = RestaurantMessage.Bookmarked;
        } else {
            await this.#restaurantBookmarkModel.deleteOne({ restaurantId, userId });
            message = RestaurantMessage.Unbookmarked;
        }

        return { message };
    }

    async update(id, restaurantDto, userDto) {
        if (id === userDto._id.toString()) throw createHttpError.BadRequest(RestaurantMessage.NotAdmin);
        await this.isValidRestaurant(id);
        const {
            name,
            logo,
            cover,
            provinceName,
            order_start,
            order_end,
            average_delivery_time,
            send_outside_city,
            categories,
        } = restaurantDto;

        const slugTranslate = await translatte(name, { from: "fa", to: "en" });
        const slugifyText = slugify(slugTranslate.text, { lower: true });
        const isExistSlug = await this.#model.findOne({ slug: slugifyText });
        if (isExistSlug) {
            slugifyText += `-${randomId()}`;
        }

        const update = await this.#model.updateOne(
            { _id: id },
            {
                name,
                logo,
                cover,
                slug: slugifyText,
                categories,
                province: {
                    name: provinceName,
                },
                order: {
                    start: order_start,
                    end: order_end,
                },
                details: {
                    average_delivery_time,
                    send_outside_city,
                },
            }
        );
        if (update.modifiedCount === 0) throw new createHttpError.BadRequest(RestaurantMessage.EditFailed);
    }

    async delete(id, userDto) {
        if (id === userDto._id.toString()) throw createHttpError.BadRequest(RestaurantMessage.NotAdmin);
        await this.isValidRestaurant(id);
        const result = await this.#model.deleteOne({ _id: id });
        if (result.deletedCount === 0) throw new createHttpError.NotFound(RestaurantMessage.NotExist);
    }

    async getRestaurantBySlug(slug, userDto) {
        let isLiked = false;
        let isBookmarked = false;
        const restaurant = await this.#model.findOne({ slug }).select("-phone -email -createdAt -updatedAt -__v");
        if (!restaurant) throw new createHttpError.NotFound(RestaurantMessage.NotFound);
        if (!restaurant.isValid) throw createHttpError.ServiceUnavailable(RestaurantMessage.NotFound);
        if (userDto) {
            const { _id: userId } = userDto;
            isLiked = !!(await this.#restaurantLikeModel.findOne({ restaurantId: restaurant._id, userId }));
            isBookmarked = !!(await this.#restaurantBookmarkModel.findOne({ restaurantId: restaurant._id, userId }));
        }
        const menu = await this.#menuModel.find({ restaurantId: restaurant._id }, "-__v").populate("foods", "-__v");

        return { restaurant: { ...restaurant._doc, isLiked, isBookmarked }, menu };
    }

    async isValidRestaurant(id) {
        if (!isValidObjectId(id)) throw new createHttpError.BadRequest(RestaurantMessage.IdNotValid);
        const restaurant = await this.#model.findById(id).populate("author", "-otp");
        if (!restaurant) throw new createHttpError.NotFound(RestaurantMessage.NotExist);
        if (!restaurant.isValid) throw createHttpError.ServiceUnavailable(RestaurantMessage.NotValidRestaurant);
        return restaurant;
    }

    async getMenusByAdmin(id) {
        const menus = await this.#menuModel.find({ restaurantId: id }, "title image slug");
        return { menus };
    }

    async getMenusEmpty(id) {
        const menus = await this.#menuModel.find({ restaurantId: id, foods: { $size: 0 } }, "title image slug");
        return { menus };
    }

    async getCommentsByAdmin(id) {
        const comments = await this.#restaurantCommentsModel
            .find({ restaurantId: id }, "-__v")
            .populate("authorId", "fullName mobile");

        return { comments };
    }

    async changeCommentStatus(commentDto) {
        const { _id: commentId, isAccepted } = commentDto;

        const updateResult = await this.#restaurantCommentsModel.updateOne(
            { _id: commentId },
            { isAccepted: !isAccepted }
        );
        if (!updateResult.modifiedCount) throw createHttpError.BadRequest(RestaurantMessage.CommentUpdateFailed);
    }

    async checkExistComment(commentId) {
        const comment = await this.#restaurantCommentsModel.findById(commentId);
        if (!comment) throw createHttpError.NotFound(RestaurantMessage.CommentNotExist);
        return { comment };
    }

    async getAllFoods(menusId) {
        const foods = await this.#foodModel
            .find({ menuId: { $in: menusId } })
            .select("-__v -description")
            .populate("menuId")
            .select("-foods -__v")
            .lean();

        return { foods };
    }

    async getAllFoodsHaveDiscount(restaurantId) {
        const foods = await this.#kindOfFoodModel
            .find({ restaurantId, "discount.percent": { $gt: 0 } })
            .select("-__v")
            .lean();

        return { foods };
    }

    async getMenusId(restaurantId) {
        return await this.#menuModel.find({ restaurantId }, "_id");
    }

    // * Discount
    async applyDiscountToAllFoods(restaurantDto, discountDto) {
        const { percent, startDate, endDate, amount } = discountDto;
        const { id: restaurantId } = restaurantDto;
        if (percent == 0) throw createHttpError.BadRequest(RestaurantMessage.DiscountNotValid);

        await this.isValidRestaurant(restaurantId);
        const result = await this.#kindOfFoodModel.updateMany(
            { restaurantId },
            { discount: { percent, startDate, endDate, amount } }
        );
        if (result.modifiedCount === 0) throw createHttpError.BadRequest(RestaurantMessage.ApplyDiscountFailed);
    }

    async changeDiscountToAllFoods(restaurantDto, discountDto) {
        const { percent, startDate, endDate, amount } = discountDto;
        const { id: restaurantId } = restaurantDto;
        if (percent == 0) throw createHttpError.BadRequest(RestaurantMessage.DiscountNotValid);

        await this.isValidRestaurant(restaurantId);
        const result = await this.#kindOfFoodModel.updateMany(
            { restaurantId },
            { discount: { percent, startDate, endDate, amount } }
        );
        if (result.modifiedCount === 0) throw createHttpError.BadRequest(RestaurantMessage.ApplyDiscountFailed);
    }

    async removeDiscountToAllFoods(restaurantDto) {
        const { id: restaurantId } = restaurantDto;

        await this.isValidRestaurant(restaurantId);
        const result = await this.#kindOfFoodModel.updateMany(
            { restaurantId },
            { discount: { percent: 0, startDate: null, endDate: null, amount: 0 } }
        );
        if (result.modifiedCount === 0) throw createHttpError.BadRequest(RestaurantMessage.DiscountRemovedFailed);
    }

    async applyDiscountFoods(restaurantDto, discountDto) {
        const { foodsId, percent, startDate, endDate, amount } = discountDto;
        const { id: restaurantId } = restaurantDto;
        if (percent == 0) throw createHttpError.BadRequest(RestaurantMessage.DiscountNotValid);

        await this.isValidRestaurant(restaurantId);
        const result = await this.#foodModel.updateMany(
            { restaurantId },
            { discount: { percent, startDate, endDate, amount } }
        );
        console.log(result);
        if (result.modifiedCount === 0) throw createHttpError.BadRequest(RestaurantMessage.ApplyDiscountFailed);
    }

    async removeDiscountFoods(restaurantDto, discountDto) {
        const { foodsId } = discountDto;
        const { id: restaurantId } = restaurantDto;

        await this.isValidRestaurant(restaurantId);
        const result = await this.#kindOfFoodModel.updateMany(
            { _id: { $in: foodsId }, restaurantId },
            { discount: { percent: 0, startDate: null, endDate: null, amount: 0 } }
        );
        if (result.modifiedCount === 0) throw createHttpError.BadRequest(RestaurantMessage.DiscountRemovedFailed);
    }

    async uploadLogo({ id: restaurantId }, fileDto) {
        await this.isValidRestaurant(restaurantId);
        const result = await this.#model.updateOne({ _id: restaurantId }, { logo: fileDto?.filename });
        if (result.modifiedCount === 0) throw createHttpError.BadRequest(RestaurantMessage.UploadImageFailed);
    }

    async removeLogo({ id: restaurantId }) {
        await this.isValidRestaurant(restaurantId);
        const result = await this.#model.updateOne({ _id: restaurantId }, { logo: "" });
        if (result.modifiedCount === 0) throw createHttpError.BadRequest(RestaurantMessage.DeleteImageFailed);
    }

    async uploadCover({ id: restaurantId }, fileDto) {
        await this.isValidRestaurant(restaurantId);
        const result = await this.#model.updateOne({ _id: restaurantId }, { cover: fileDto?.filename });
        if (result.modifiedCount === 0) throw createHttpError.BadRequest(RestaurantMessage.UploadImageFailed);
    }

    async removeCover({ id: restaurantId }) {
        await this.isValidRestaurant(restaurantId);
        const result = await this.#model.updateOne({ _id: restaurantId }, { cover: "" });
        if (result.modifiedCount === 0) throw createHttpError.BadRequest(RestaurantMessage.DeleteImageFailed);
    }
}

module.exports = RestaurantService;
