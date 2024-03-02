const router = require("express").Router();
const UserController = require("./user.controller");
const { AccessTokenGuard, RefreshTokenGuard } = require("../../common/guard/auth.guard");

const controller = new UserController();

router.use(AccessTokenGuard, RefreshTokenGuard);
router.get("/whoami", controller.whoAmI);
// restaurant
router.patch("/restaurant/:id/comment", controller.changeRateForRestaurant);
router.route("/restaurant/:id/like").patch(controller.likeRestaurant).delete(controller.removeLikeRestaurant);
router.patch("/restaurant/comment/:id/like", controller.addLikeRestaurantComment);
router.patch("/restaurant/comment/:id/unlike", controller.removeLikeRestaurantComment);
router.patch("/restaurant/comment", controller.addCommentRestaurant);
router
    .route("/restaurant/:id/bookmark")
    .patch(controller.bookmarkRestaurant)
    .delete(controller.removeBookmarkRestaurant);
// food
router.patch("/food/:id/comment", controller.changeRateForFood);
router.post("/food/comment", controller.addCommentFood);
router.route("/food/:id/like").patch(controller.likeFood).delete(controller.removeLikeFood);
router.route("/food/:id/bookmark").patch(controller.bookmarkFood).delete(controller.removeBookmarkFood);

module.exports = { UserRouter: router };
