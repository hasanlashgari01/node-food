const { isValidObjectId } = require("mongoose");
const createHttpError = require("http-errors");
const RestaurantModel = require("../../module/restaurant/restaurant.schema");
const RestaurantMessage = require("../../module/restaurant/restaurant.messages");

const checkResuatrantAdmin = async (req, res, next) => {
    try {
        const { id: restaurantId } = req.params;
        const { _id: userId } = req.user;
        if (!isValidObjectId(restaurantId)) throw createHttpError.NotFound(RestaurantMessage.IdNotValid);
        const restaurant = await RestaurantModel.findById(restaurantId, "author").lean();
        if (!restaurant) throw createHttpError.NotFound(RestaurantMessage.NotExist);
        if (restaurant?.author?.toString() !== userId?.toString())
            throw createHttpError.MethodNotAllowed(RestaurantMessage.NotAdmin);

        return next();
    } catch (error) {
        next(error);
    }
};

module.exports = { checkResuatrantAdmin };
