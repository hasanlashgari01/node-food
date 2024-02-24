const createHttpError = require("http-errors");
const RestaurantModel = require("../../module/restaurant/restaurant.schema");
const RestaurantMessage = require("../../module/restaurant/restaurant.messages");

const checkResuatrantAdmin = async (req, res, next) => {
    try {
        const { author } = req.params;
        const isResaurantAdmin = await RestaurantModel.findById(author._id);
        if (!isResaurantAdmin) throw createHttpError.MethodNotAllowed(RestaurantMessage.NotAdmin)

        return next()
    } catch (error) {
        next(error);
    }
};

module.exports = { checkResuatrantAdmin };