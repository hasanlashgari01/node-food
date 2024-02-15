const router = require("express").Router();
const CategoryController = require("./category.controller");
const validate = require("../../common/middleware/joi.validator");
const { createCategoryValidator } = require("./category.validation");

const controller = new CategoryController();

router.get("/", controller.getAll);
router.post("/create", validate(createCategoryValidator), controller.create);
router.get("/categoryTitle", controller.getCategoryTitle);

module.exports = { CategoryRouter: router };
