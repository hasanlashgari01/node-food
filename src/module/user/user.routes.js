const router = require("express").Router();
const UserController = require("./user.controller");

const controller = new UserController();

router.get("/whoami", controller.whoAmI);

module.exports = { UserRouter: router };
