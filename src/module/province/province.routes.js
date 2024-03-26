const router = require("express").Router();
const ProvinceController = require("./province.controller");
const { AccessTokenGuard, RefreshTokenGuard } = require("../../common/guard/auth.guard");
const { isAdminGuard } = require("../../common/guard/admin.guard");

const controller = new ProvinceController();

router.route("/").get(controller.getAll).post(AccessTokenGuard, RefreshTokenGuard, isAdminGuard, controller.create);
router
    .route("/many")
    .post(AccessTokenGuard, RefreshTokenGuard, isAdminGuard, controller.createMany)
    .delete(AccessTokenGuard, RefreshTokenGuard, isAdminGuard, controller.deleteMany);
router
    .route("/:id")
    .get(AccessTokenGuard, RefreshTokenGuard, isAdminGuard, controller.getOne)
    .put(AccessTokenGuard, RefreshTokenGuard, isAdminGuard, controller.update)
    .delete(AccessTokenGuard, RefreshTokenGuard, isAdminGuard, controller.delete);

module.exports = { ProvinceRouter: router };
