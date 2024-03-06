const router = require("express").Router();
const FoodController = require("./food.controller");
const validate = require("../../common/middleware/joi.validator");
const { FoodValidator, FoodUpdateValidator } = require("./food.validation");
const { foodUpload } = require("../../common/utils/multer");
const { AccessTokenGuard, RefreshTokenGuard } = require("../../common/guard/auth.guard");

const controller = new FoodController();

router.patch("/comment/:id/status", AccessTokenGuard, RefreshTokenGuard, controller.changeCommentStatus);
router.get("/:id/comment", AccessTokenGuard, RefreshTokenGuard, controller.allComments);
router.route("/kind/many/:id").delete(controller.deleteKindMany);
router.route("/kind/:id").delete(controller.deleteKind);
router.route("/").post(AccessTokenGuard, RefreshTokenGuard, foodUpload(), validate(FoodValidator), controller.create);
router.route("/:id", validate(FoodUpdateValidator)).patch(controller.update).delete(controller.delete);

module.exports = { FoodRouter: router };
