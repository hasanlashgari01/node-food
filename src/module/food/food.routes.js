const router = require("express").Router();
const FoodController = require("./food.controller");
const validate = require("../../common/middleware/joi.validator");
const { MenuValidator, MenuUpdateValidator } = require("./food.validation");

const controller = new FoodController();

router.route("/").post(validate(MenuValidator), controller.create);
router.route("/:id", validate(MenuUpdateValidator)).patch(controller.update).delete(controller.delete);

module.exports = { MenuRouter: router };
