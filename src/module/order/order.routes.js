const router = require("express").Router();
const CouponController = require("./order.controller");
const { AccessTokenGuard, RefreshTokenGuard } = require("../../common/guard/auth.guard");
const { isAdminGuard } = require("../../common/guard/admin.guard");
const { checkResuatrantAdmin } = require("../../common/guard/checkResuatrantAdmin.guard");

const controller = new CouponController();

router.use(AccessTokenGuard, RefreshTokenGuard);

// * Restaurant
router.route("/restaurant/:id").get(checkResuatrantAdmin, controller.getAllOrders);
router.route("/restaurant/:id/order/:orderId").get(checkResuatrantAdmin, controller.getOrder);
// * User
router.route("/").get(controller.getAll).post(controller.create);
router.route("/:id").put(controller.payOrder).patch(controller.cancelOrder);
// * Admin
router.use(isAdminGuard);
router.route("/admin").get(controller.allUsersHaveNotOrder);

module.exports = { OrderRouter: router };
