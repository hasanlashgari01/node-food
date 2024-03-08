const router = require("express").Router();
const HomeController = require("./home.controller");

const controller = new HomeController();

// * Home List
router.get("/list/categories", controller.getListCategories);
router.get("/list/foods", controller.getListFoodsParty);
router.get("/list/restaurants/newest", controller.getNewestRestaurant);
router.get("/list/restaurants/best", controller.getBestRestaurants);
// * All
router.get("/all/categories", controller.getCategories);
router.get("/all/foods", controller.getFoodsParty);
router.get("/all/restaurants", controller.getRestaurants);

module.exports = { HomeRouter: router };
