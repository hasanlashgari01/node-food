const router = require("express").Router();
const FoodController = require("./food.controller");
const validate = require("../../common/middleware/joi.validator");
const { FoodValidator, FoodUpdateValidator, commentValidator } = require("./food.validation");
const { foodUpload } = require("../../common/utils/multer");
const { AccessTokenGuard, RefreshTokenGuard, PublicGuard } = require("../../common/guard/auth.guard");
const { checkResuatrantAdmin } = require("../../common/guard/checkResuatrantAdmin.guard");

const controller = new FoodController();

router.route("/comment/:id").get(AccessTokenGuard, RefreshTokenGuard, controller.getCommentById);
router.route("/:id/like").patch(AccessTokenGuard, RefreshTokenGuard, controller.toggleLike);
router.route("/:id/bookmark").patch(AccessTokenGuard, RefreshTokenGuard, controller.toggleBookmark);
router.patch("/comment/:id/status", AccessTokenGuard, RefreshTokenGuard, controller.changeCommentStatus);
router.get("/:id/comment/admin", AccessTokenGuard, RefreshTokenGuard, checkResuatrantAdmin, controller.allComments);
router
    .route("/comment")
    .post(AccessTokenGuard, RefreshTokenGuard, validate(commentValidator), controller.createComment);
router
    .route("/:id/comment")
    .get(PublicGuard, controller.getComments)
    .patch(AccessTokenGuard, RefreshTokenGuard, controller.toggleLikeComment);
router.get("/:id/similar", controller.getSuggestionSimilar);
router.get("/:id/popular", controller.getSuggestionPopular);
router.get("/:id/discount", controller.getSuggestionDiscount);
router.get("/:id/news", controller.getNews);
router.route("/kind/many/:id").delete(controller.deleteKindMany);
router.route("/kind/:id").delete(controller.deleteKind);
router
    .route("/:id")
    .post(AccessTokenGuard, RefreshTokenGuard, foodUpload(), validate(FoodValidator), controller.create);
router
    .route("/:id")
    .get(PublicGuard, controller.getOne)
    .put(AccessTokenGuard, RefreshTokenGuard, foodUpload(), validate(FoodUpdateValidator), controller.update)
    .delete(AccessTokenGuard, RefreshTokenGuard, controller.delete);

module.exports = { FoodRouter: router };
