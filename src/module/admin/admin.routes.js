const router = require("express").Router();
const AdminController = require("./admin.controller");
const { AccessTokenGuard, RefreshTokenGuard } = require("../../common/guard/auth.guard");
const { isAdminGuard } = require("../../common/guard/admin.guard");
const validate = require("../../common/middleware/joi.validator");
const { MenuValidator } = require("./admin.validation");
const { menuUpload } = require("../../common/utils/multer");

const controller = new AdminController();

router.use(AccessTokenGuard, RefreshTokenGuard, isAdminGuard);
router.route("/restaurant").get(controller.getAllRestaurant);
router.route("/restaurant/banned").get(controller.getAllRestaurantBanned);
router.route("/restaurant/:id/status").get(controller.changeRestaurantValid);
router.route("/restaurant/:id/ban").get(controller.banRestaurant).delete(controller.removeRestaurantBan);
router.route("/restaurant/:id").get(controller.getRestaurant);
router.route("/menu").post(menuUpload(), validate(MenuValidator), controller.createMenu);

module.exports = { AdminRouter: router };
