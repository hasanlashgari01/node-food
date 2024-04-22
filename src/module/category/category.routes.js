const router = require("express").Router();
const CategoryController = require("./category.controller");

const controller = new CategoryController();

router.get("/", controller.getAll);
router.post("/create", controller.create);
router.get("/categoryTitle", controller.getCategoryTitle);
router.get("/search/:search", controller.searchByTitle);
router.route("/:id").put(controller.update).get(controller.getCategory);

module.exports = { CategoryRouter: router };
