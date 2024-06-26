const router = require("express").Router();
const FilesController = require("./files.controller");

const controller = new FilesController();

router.get("/public/food/:fileName", controller.getFood);
router.get("/public/menu/:fileName", controller.getMenu);
router.get("/public/restaurant/:fileName", controller.getRestaurant);
router.get("/public/user/:fileName", controller.getAvatar);

module.exports = { FilesRouter: router };
