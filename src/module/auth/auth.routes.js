const router = require("express").Router();
const AuthController = require("./auth.controller");

const controller = new AuthController();

router.post("/send-otp", controller.sendOtp);
router.post("/check-otp", controller.checkOtp);

module.exports = { AuthRouter: router };
