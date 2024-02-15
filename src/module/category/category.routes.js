const router = require("express").Router();
const CategoryController = require("./category.controller");

const controller = new CategoryController();

router.get("/", controller.getAll);

module.exports = { CategoryRouter: router };
