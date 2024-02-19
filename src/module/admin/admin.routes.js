const router = require("express").Router();
const AdminController = require("./admin.controller");
const { AccessTokenGuard, RefreshTokenGuard } = require("../../common/guard/auth.guard");
const { isAdminGuard } = require("../../common/guard/admin.guard");

const controller = new AdminController();

router.use(AccessTokenGuard, RefreshTokenGuard, isAdminGuard);
router.route("/dashboard").get(controller.test);

module.exports = { AdminRouter: router };
