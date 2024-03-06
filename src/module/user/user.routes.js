const router = require("express").Router();
const UserController = require("./user.controller");
const { AccessTokenGuard, RefreshTokenGuard } = require("../../common/guard/auth.guard");

const controller = new UserController();

router.use(AccessTokenGuard, RefreshTokenGuard);
router.route("/").put(controller.updateProfile).patch(controller.updatePassword);
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
router.patch("/food/comment/:id/like", controller.addLikeFoodComment);
router.patch("/food/comment/:id/unlike", controller.removeLikeFoodComment);
router.route("/food/:id/bookmark").patch(controller.bookmarkFood).delete(controller.removeBookmarkFood);
// cart
router.put("/cart/increment", controller.incrementCart);
router.put("/cart/decrement", controller.decrementCart);

module.exports = { UserRouter: router };
