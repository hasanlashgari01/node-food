const router = require("express").Router();
const CategoryController = require("./category.controller");
const validate = require("../../common/middleware/joi.validator");
const { CategoryValidator } = require("./category.validation");

const controller = new CategoryController();

router.get("/", controller.getAll);
router.post("/create", validate(CategoryValidator), controller.create);
router.get("/categoryTitle", controller.getCategoryTitle);
router.get("/search/:search", controller.searchByTitle);
router.route("/:id").put(validate(CategoryValidator), controller.update).get(controller.getCategory);

module.exports = { CategoryRouter: router };
