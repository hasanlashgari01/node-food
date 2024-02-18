const router = require("express").Router();
const FoodController = require("./food.controller");
const validate = require("../../common/middleware/joi.validator");
const { FoodValidator, FoodUpdateValidator } = require("./food.validation");
const { foodUpload } = require("../../common/utils/multer");

const controller = new FoodController();

router.route("/kind/many/:id").delete(controller.deleteKindMany);
router.route("/kind/:id").delete(controller.deleteKind);
router.route("/").post(foodUpload(), validate(FoodValidator), controller.create);
router.route("/:id", validate(FoodUpdateValidator)).patch(controller.update).delete(controller.delete);

module.exports = { FoodRouter: router };
