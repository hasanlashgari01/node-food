const router = require("express").Router();
const CouponController = require("./order.controller");
const { AccessTokenGuard, RefreshTokenGuard } = require("../../common/guard/auth.guard");
const { isAdminGuard } = require("../../common/guard/admin.guard");

const controller = new CouponController();

router.use(AccessTokenGuard, RefreshTokenGuard);

router.route("/").get(controller.getAll).post(controller.create);
// * Admin
router.use(isAdminGuard);
router.route("/admin").get(controller.allUsersHaveNotOrder);

module.exports = { OrderRouter: router };
