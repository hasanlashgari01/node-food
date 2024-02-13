const router = require("express").Router();
const validate = require("../../common/middleware/joi.validator");
const AuthController = require("./auth.controller");
const { sendOtpValidatorSchema } = require("./auth.validation");

const controller = new AuthController();

router.post("/send-otp", validate(sendOtpValidatorSchema), controller.sendOtp);
router.post("/check-otp", controller.checkOtp);

module.exports = { AuthRouter: router };
