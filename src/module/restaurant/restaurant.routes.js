const router = require("express").Router();
const RestaurantController = require("./restaurant.controller");
const validate = require("../../common/middleware/joi.validator");
const { RestaurantValidator, UpdateRestaurantValidator, commentValidator } = require("./restaurant.validation");
const { logoUpload, coverUpload } = require("../../common/utils/multer");
const { AccessTokenGuard, RefreshTokenGuard, PublicGuard } = require("../../common/guard/auth.guard");
const { checkResuatrantAdmin } = require("../../common/guard/checkResuatrantAdmin.guard");

const controller = new RestaurantController();

// mix
router
    .route("/:id/logo", AccessTokenGuard, RefreshTokenGuard, checkResuatrantAdmin)
    .patch(logoUpload(), controller.uploadLogo)
    .delete(controller.removeLogo);
router
    .route("/:id/comment")
    .get(PublicGuard, controller.getComments)
    .patch(AccessTokenGuard, RefreshTokenGuard, controller.toggleLikeComment);
router.get("/popular", controller.getPopularRestaurants);
// router.get("/")
router.route("/:id/food").get(controller.getAllFoods);
router.get("/:id/similar", controller.getSuggestionSimilarById);
router.get("/:id/popular", controller.getSuggestionPopularById);
router.get("/:id/news", controller.getNews);
router
    .route("/:id")
    .get(controller.getOne)
    .patch(
        AccessTokenGuard,
        RefreshTokenGuard,
        checkResuatrantAdmin,
        validate(UpdateRestaurantValidator),
        controller.update
    );
// public
router.route("/slug/:slug").get(PublicGuard, controller.getRestaurantBySlug);
// auth
router.use(AccessTokenGuard, RefreshTokenGuard);
router.post("/", validate(RestaurantValidator), controller.create);
router.route("/comment/:id").get(controller.getCommentById);
router.patch("/comment/:id/status", controller.changeCommentStatus);
router.post("/comment", validate(commentValidator), controller.createComment);
router.route("/:id/like").patch(controller.toggleLike);
router.route("/:id/bookmark").patch(controller.toggleBookmark);
// admin restaurant
router.use(checkResuatrantAdmin);
router.get("/:id/menu", controller.getMenusByAdmin);
router.get("/:id/menu/empty", controller.getMenusEmpty);
router.get("/:id/comment/admin", controller.getCommentsByAdmin);
router
    .route("/:id/food/discount")
    .get(controller.getAllFoodsHaveDiscount)
    .put(controller.applyDiscountFoods)
    .delete(controller.removeDiscountFoods);
router
    .route("/:id/discount")
    .put(controller.applyDiscountToAllFoods)
    .patch(controller.changeDiscountToAllFoods)
    .delete(controller.removeDiscountToAllFoods);
router.route("/:id/cover").patch(coverUpload(), controller.uploadCover).delete(controller.removeCover);

module.exports = { RestaurantRouter: router };
