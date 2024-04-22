const router = require("express").Router();
const ProvinceController = require("./province.controller");
const { AccessTokenGuard, RefreshTokenGuard } = require("../../common/guard/auth.guard");
const { isAdminGuard } = require("../../common/guard/admin.guard");

const controller = new ProvinceController();

router.route("/").get(controller.getAll).post(AccessTokenGuard, RefreshTokenGuard, isAdminGuard, controller.create);
router.route("/list").get(controller.getListProvince);
// admin
router.use(AccessTokenGuard, RefreshTokenGuard, isAdminGuard);
router.route("/many").post(controller.createMany).delete(controller.deleteMany);
router.route("/:id").get(controller.getOne).put(controller.update).delete(controller.delete);

module.exports = { ProvinceRouter: router };
