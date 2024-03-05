const router = require("express").Router();
const CouponController = require("./coupon.controller");
const { AccessTokenGuard, RefreshTokenGuard } = require("../../common/guard/auth.guard");
const { isAdminGuard } = require("../../common/guard/admin.guard");
const validate = require("../../common/middleware/joi.validator");
const { CreateCouponValidator } = require("./coupon.validation");

const controller = new CouponController();

router.use(AccessTokenGuard, RefreshTokenGuard);
router.route("/").post(isAdminGuard, validate(CreateCouponValidator), controller.create);

module.exports = { CouponRouter: router };
