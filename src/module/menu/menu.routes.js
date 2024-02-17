const router = require("express").Router();
const MenuController = require("./menu.controller");
const validate = require("../../common/middleware/joi.validator");
const { MenuValidator, MenuUpdateValidator } = require("./menu.validation");
const { AccessTokenGuard, RefreshTokenGuard } = require("../../common/guard/auth.guard");

const controller = new MenuController();

router.use(AccessTokenGuard, RefreshTokenGuard);
router.route("/").post(validate(MenuValidator), controller.create);
router.route("/:id").patch(validate(MenuUpdateValidator), controller.update).delete(controller.delete);

module.exports = { MenuRouter: router };
