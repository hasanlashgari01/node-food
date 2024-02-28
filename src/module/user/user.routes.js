const router = require("express").Router();
const UserController = require("./user.controller");
const { AccessTokenGuard, RefreshTokenGuard } = require("../../common/guard/auth.guard");

const controller = new UserController();

router.use(AccessTokenGuard, RefreshTokenGuard);
router.get("/whoami", controller.whoAmI);
router.route("/comment").post(controller.createComment);
router.route("/comment/:id").patch(controller.changeRateForRestaurant);
router.route("/restaurant/:id/like").patch(controller.likeRestaurant).delete(controller.removeLikeRestaurant);
router.route("/restaurant/:id/bookmark").patch(controller.bookmarkRestaurant).delete(controller.removeBookmarkRestaurant);
router.route("/food/:id/like").patch(controller.likeFood).delete(controller.removeLikeFood);
router.route("/food/:id/bookmark").patch(controller.bookmarkFood).delete(controller.removeBookmarkFood);

module.exports = { UserRouter: router };
