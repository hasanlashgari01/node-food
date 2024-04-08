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
router
    .route("/:id")
    .post(AccessTokenGuard, RefreshTokenGuard, foodUpload(), validate(FoodValidator), controller.create);
router
    .route("/:id")
    .get(controller.getOne)
    .put(AccessTokenGuard, RefreshTokenGuard, foodUpload(), validate(FoodUpdateValidator), controller.update)
    .delete(AccessTokenGuard, RefreshTokenGuard, controller.delete);

module.exports = { FoodRouter: router };
