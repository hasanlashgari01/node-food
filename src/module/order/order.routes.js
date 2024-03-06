const router = require("express").Router();
const CouponController = require("./order.controller");
const { AccessTokenGuard, RefreshTokenGuard } = require("../../common/guard/auth.guard");

const controller = new CouponController();

router.use(AccessTokenGuard, RefreshTokenGuard);

module.exports = { OrderRouter: router };
