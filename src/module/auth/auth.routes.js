const router = require("express").Router();
const AuthController = require("./auth.controller");
const validate = require("../../common/middleware/joi.validator");
const { sendOtpValidatorSchema, checkOtpValidatorSchema } = require("./auth.validation");

const controller = new AuthController();

router.post("/send-otp", validate(sendOtpValidatorSchema), controller.sendOtp);
router.post("/check-otp", validate(checkOtpValidatorSchema), controller.checkOtp);
router.get("/logout", controller.logout);

module.exports = { AuthRouter: router };
