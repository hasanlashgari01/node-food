const router = require("express").Router();
const UserController = require("./user.controller");
const { AccessTokenGuard, RefreshTokenGuard } = require("../../common/guard/auth.guard");

const controller = new UserController();

router.use(AccessTokenGuard, RefreshTokenGuard);
router.get("/whoami", controller.whoAmI);
router.patch("/comment/restaurant/:id", controller.changeRateForRestaurant);
router.post("/comment/restaurant", controller.addCommentRestaurant);
router.patch("/comment/food/:id", controller.changeRateForFood);
router.post("/comment/food", controller.addCommentFood);
router.route("/restaurant/:id/like").patch(controller.likeRestaurant).delete(controller.removeLikeRestaurant);
router
    .route("/restaurant/:id/bookmark")
    .patch(controller.bookmarkRestaurant)
    .delete(controller.removeBookmarkRestaurant);
router.route("/food/:id/like").patch(controller.likeFood).delete(controller.removeLikeFood);
router.route("/food/:id/bookmark").patch(controller.bookmarkFood).delete(controller.removeBookmarkFood);

module.exports = { UserRouter: router };
