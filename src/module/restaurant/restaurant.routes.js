const router = require("express").Router();
const RestaurantController = require("./restaurant.controller");
const validate = require("../../common/middleware/joi.validator");
const { RestaurantValidator } = require("./restaurant.validation");
const { restaurantUpload } = require("../../common/utils/multer");
const { AccessTokenGuard, RefreshTokenGuard } = require("../../common/guard/auth.guard");

const controller = new RestaurantController();

router
    .route("/")
    .post(AccessTokenGuard, RefreshTokenGuard, restaurantUpload(), validate(RestaurantValidator), controller.create);
router
    .route("/:id")
    .get(controller.getOne)
    .patch(AccessTokenGuard, RefreshTokenGuard, controller.update)
    .delete(AccessTokenGuard, RefreshTokenGuard, controller.delete);

module.exports = { RestaurantRouter: router };