const router = require("express").Router();
const AdminController = require("./admin.controller");
const { AccessTokenGuard, RefreshTokenGuard } = require("../../common/guard/auth.guard");
const { isAdminGuard } = require("../../common/guard/admin.guard");
const validate = require("../../common/middleware/joi.validator");
const { SuggestionMenuValidator, UpdateSuggestionMenuValidator } = require("./admin.validation");
const { menuUpload } = require("../../common/utils/multer");

const controller = new AdminController();

router.use(AccessTokenGuard, RefreshTokenGuard, isAdminGuard);
router.route("/restaurant").get(controller.getAllRestaurant);
router.route("/restaurant/banned").get(controller.getAllRestaurantBanned);
router.route("/restaurant/status/:isValid").get(controller.getAllRestaurantWithStatus);
router.route("/restaurant/:id/status").get(controller.changeRestaurantValid);
router.route("/restaurant/:id/ban").get(controller.banRestaurant).delete(controller.removeRestaurantBan);
router.route("/restaurant/:id").get(controller.getRestaurant);
router
    .route("/menu")
    .get(controller.getAllSuggestionMenu)
    .post(menuUpload(), validate(SuggestionMenuValidator), controller.createSuggestionMenu);
router
    .route("/menu/:id")
    .patch(menuUpload(), validate(UpdateSuggestionMenuValidator), controller.editSuggestionMenu)
    .delete(controller.removeSuggestionMenu);
router.route("/users").get(controller.getAllUsers);
router.route("/users/ban").get(controller.getUsersBanned);
router.route("/users/:id/ban").get(controller.banUser);
router.route("/users/:id/acceptSeller").get(controller.acceptAsSeller);
router.route("/users/:role").get(controller.getUsersByRole);
router.route("/sellers").get(controller.getAllSellers);

module.exports = { AdminRouter: router };
