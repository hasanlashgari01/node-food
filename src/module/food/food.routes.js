const router = require("express").Router();
const FoodController = require("./food.controller");
const validate = require("../../common/middleware/joi.validator");
const { FoodValidator, FoodUpdateValidator } = require("./food.validation");

const controller = new FoodController();

router.route("/kind/:id").delete(controller.deleteKind);
router.route("/").post(validate(FoodValidator), controller.create);
router.route("/:id", validate(FoodUpdateValidator)).patch(controller.update).delete(controller.delete);

module.exports = { FoodRouter: router };
