const router = require("express").Router();
const RestaurantController = require("./restaurant.controller");
const validate = require("../../common/middleware/joi.validator");
const { RestaurantValidator, UpdateRestaurantValidator, commentValidator } = require("./restaurant.validation");
const { logoUpload, coverUpload } = require("../../common/utils/multer");
const { AccessTokenGuard, RefreshTokenGuard, PublicGuard } = require("../../common/guard/auth.guard");
const { checkResuatrantAdmin } = require("../../common/guard/checkResuatrantAdmin.guard");

const controller = new RestaurantController();

router.route("/comment/:id").get(AccessTokenGuard, RefreshTokenGuard, controller.getCommentById);
router.route("/slug/:slug").get(PublicGuard, controller.getRestaurantBySlug);
router.route("/:id/like").patch(AccessTokenGuard, RefreshTokenGuard, controller.toggleLike);
router.route("/:id/bookmark").patch(AccessTokenGuard, RefreshTokenGuard, controller.toggleBookmark);
router.patch("/comment/:id/status", AccessTokenGuard, RefreshTokenGuard, controller.changeCommentStatus);
router.get("/:id/menu", AccessTokenGuard, RefreshTokenGuard, checkResuatrantAdmin, controller.getMenusByAdmin);
router.get("/:id/menu/empty", AccessTokenGuard, RefreshTokenGuard, checkResuatrantAdmin, controller.getMenusEmpty);
router.get(
    "/:id/comment/admin",
    AccessTokenGuard,
    RefreshTokenGuard,
    checkResuatrantAdmin,
    controller.getCommentsByAdmin
);
router
    .route("/comment")
    .post(AccessTokenGuard, RefreshTokenGuard, validate(commentValidator), controller.createComment);
router
    .route("/:id/comment")
    .get(PublicGuard, controller.getComments)
    .patch(AccessTokenGuard, RefreshTokenGuard, controller.toggleLikeComment);
router.route("/:id/food").get(controller.getAllFoods);
router
    .route("/:id/food/discount")
    .get(AccessTokenGuard, RefreshTokenGuard, checkResuatrantAdmin, controller.getAllFoodsHaveDiscount)
    .put(AccessTokenGuard, RefreshTokenGuard, checkResuatrantAdmin, controller.applyDiscountFoods)
    .delete(AccessTokenGuard, RefreshTokenGuard, checkResuatrantAdmin, controller.removeDiscountFoods);
router
    .route("/:id/discount")
    .put(AccessTokenGuard, RefreshTokenGuard, checkResuatrantAdmin, controller.applyDiscountToAllFoods)
    .patch(AccessTokenGuard, RefreshTokenGuard, checkResuatrantAdmin, controller.changeDiscountToAllFoods)
    .delete(AccessTokenGuard, RefreshTokenGuard, checkResuatrantAdmin, controller.removeDiscountToAllFoods);
router.route("/").post(AccessTokenGuard, RefreshTokenGuard, validate(RestaurantValidator), controller.create);
router
    .route("/:id")
    .get(controller.getOne)
    .patch(
        AccessTokenGuard,
        RefreshTokenGuard,
        checkResuatrantAdmin,
        validate(UpdateRestaurantValidator),
        controller.update
    )
    .delete(AccessTokenGuard, RefreshTokenGuard, controller.delete);
router
    .route("/:id/logo", AccessTokenGuard, RefreshTokenGuard, checkResuatrantAdmin)
    .patch(logoUpload(), controller.uploadLogo)
    .delete(controller.removeLogo);
router
    .route("/:id/cover", AccessTokenGuard, RefreshTokenGuard, checkResuatrantAdmin)
    .patch(coverUpload(), controller.uploadCover)
    .delete(controller.removeCover);

module.exports = { RestaurantRouter: router };
