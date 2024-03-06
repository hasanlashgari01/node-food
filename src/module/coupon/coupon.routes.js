const router = require("express").Router();
const CouponController = require("./coupon.controller");
const { AccessTokenGuard, RefreshTokenGuard } = require("../../common/guard/auth.guard");
const { isAdminGuard } = require("../../common/guard/admin.guard");
const validate = require("../../common/middleware/joi.validator");
const { CreateCouponValidator } = require("./coupon.validation");

const controller = new CouponController();

router.use(AccessTokenGuard, RefreshTokenGuard);
router
    .route("/")
    .post(isAdminGuard, validate(CreateCouponValidator), controller.create)
    .get(isAdminGuard, controller.getAll)
    .delete(isAdminGuard, controller.deleteMany);
router
    .route("/:id")
    .put(isAdminGuard, validate(CreateCouponValidator), controller.update)
    .delete(isAdminGuard, controller.deleteOne);

module.exports = { CouponRouter: router };
