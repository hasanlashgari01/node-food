const router = require("express").Router();
const AdminController = require("./admin.controller");
const { AccessTokenGuard, RefreshTokenGuard } = require("../../common/guard/auth.guard");
const { isAdminGuard } = require("../../common/guard/admin.guard");

const controller = new AdminController();

router.use(AccessTokenGuard, RefreshTokenGuard, isAdminGuard);
router.route("/restaurant").get(controller.getAllRestaurant);
router.route("/restaurant/:id/status").get(controller.changeRestaurantValid);
router.route("/restaurant/:id").get(controller.getRestaurant);

module.exports = { AdminRouter: router };
