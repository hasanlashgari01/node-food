const router = require("express").Router();
const RestaurantController = require("./restaurant.controller");
const validate = require("../../common/middleware/joi.validator");
const { RestaurantValidator } = require("./restaurant.validation");
const { AccessTokenGuard, RefreshTokenGuard } = require("../../common/guard/auth.guard");

const controller = new RestaurantController();

router.use(AccessTokenGuard, RefreshTokenGuard);
router.route("/").post(validate(RestaurantValidator), controller.create);
router.route("/:id").get(controller.getOne).patch(controller.update).delete(controller.delete);

module.exports = { RestaurantRouter: router };
