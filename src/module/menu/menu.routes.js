const router = require("express").Router();
const MenuController = require("./menu.controller");
const validate = require("../../common/middleware/joi.validator");
const { MenuValidator, MenuUpdateValidator } = require("./menu.validation");
const { AccessTokenGuard, RefreshTokenGuard } = require("../../common/guard/auth.guard");

const controller = new MenuController();

router.route("/").post(AccessTokenGuard, RefreshTokenGuard, validate(MenuValidator), controller.create);
router.route("/slug/:slug").get(controller.getMenuBySlug);
router
    .route("/:id", validate(MenuUpdateValidator))
    .get(controller.getMenuById)
    .patch(AccessTokenGuard, RefreshTokenGuard, controller.update)
    .delete(AccessTokenGuard, RefreshTokenGuard, controller.delete);

module.exports = { MenuRouter: router };
