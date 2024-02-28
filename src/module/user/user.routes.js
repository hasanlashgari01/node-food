const router = require("express").Router();
const UserController = require("./user.controller");
const { AccessTokenGuard, RefreshTokenGuard } = require("../../common/guard/auth.guard");

const controller = new UserController();

router.get("/whoami", AccessTokenGuard, RefreshTokenGuard, controller.whoAmI);
router.route("/comment").post(AccessTokenGuard, RefreshTokenGuard, controller.createComment);

module.exports = { UserRouter: router };
