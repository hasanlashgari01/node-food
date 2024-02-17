const router = require("express").Router();
const RestaurantController = require("./category.controller");
const validate = require("../../common/middleware/joi.validator");
const { RestaurantValidator } = require("./restaurant.validation");

const controller = new RestaurantController();

router.post("/create", validate(RestaurantValidator), controller.create);

module.exports = { RestaurantRouter: router };
