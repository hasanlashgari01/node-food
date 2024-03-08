const router = require("express").Router();
const ProvinceController = require("./province.controller");
const { AccessTokenGuard, RefreshTokenGuard } = require("../../common/guard/auth.guard");
const { isAdminGuard } = require("../../common/guard/admin.guard");

const controller = new ProvinceController();

router.route("/").get(controller.getAll).post(AccessTokenGuard, RefreshTokenGuard, isAdminGuard, controller.create);
router.route("/many").post(AccessTokenGuard, RefreshTokenGuard, isAdminGuard, controller.createMany);

module.exports = { ProvinceRouter: router };
