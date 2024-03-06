const router = require("express").Router();
const RestaurantController = require("./restaurant.controller");
const validate = require("../../common/middleware/joi.validator");
const { RestaurantValidator } = require("./restaurant.validation");
const { restaurantUpload } = require("../../common/utils/multer");
const { AccessTokenGuard, RefreshTokenGuard } = require("../../common/guard/auth.guard");
const { checkResuatrantAdmin } = require("../../common/guard/checkResuatrantAdmin.guard");

const controller = new RestaurantController();

router.route("/slug/:slug").get(controller.getRestaurantBySlug);
router.patch("/comment/:id/status", AccessTokenGuard, RefreshTokenGuard, controller.changeCommentStatus);
router.get("/:id/menu", AccessTokenGuard, RefreshTokenGuard, checkResuatrantAdmin, controller.getMenusByAdmin);
router.get("/:id/menu/empty", AccessTokenGuard, RefreshTokenGuard, checkResuatrantAdmin, controller.getMenusEmpty);
router.get("/:id/comment", AccessTokenGuard, RefreshTokenGuard, checkResuatrantAdmin, controller.getCommentsByAdmin);
router.route("/:id/food").get(controller.getAllFoods);
router
    .route("/:id/food/discount")
    .get(controller.getAllFoodsHaveDiscount)
    .put(AccessTokenGuard, RefreshTokenGuard, checkResuatrantAdmin, controller.applyDiscountFoods)
    .patch(AccessTokenGuard, RefreshTokenGuard, checkResuatrantAdmin, controller.changeDiscountFoods)
    .delete(AccessTokenGuard, RefreshTokenGuard, checkResuatrantAdmin, controller.removeDiscountFoods);
router
    .route("/:id/discount")
    .put(AccessTokenGuard, RefreshTokenGuard, checkResuatrantAdmin, controller.applyDiscountToAllFoods)
    .patch(AccessTokenGuard, RefreshTokenGuard, checkResuatrantAdmin, controller.changeDiscountToAllFoods)
    .delete(AccessTokenGuard, RefreshTokenGuard, checkResuatrantAdmin, controller.removeDiscountToAllFoods);
router
    .route("/")
    .post(AccessTokenGuard, RefreshTokenGuard, restaurantUpload(), validate(RestaurantValidator), controller.create);
router
    .route("/:id")
    .get(controller.getOne)
    .patch(AccessTokenGuard, RefreshTokenGuard, controller.update)
    .delete(AccessTokenGuard, RefreshTokenGuard, controller.delete);

module.exports = { RestaurantRouter: router };
