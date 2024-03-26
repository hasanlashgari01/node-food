const Joi = require("joi");

const sendOtpValidatorSchema = Joi.object({
    fullName: Joi.string().min(8).max(30).required().label("نام معتبر نیست"),
    signUpMethod: Joi.string().required().valid("mobile", "email").label("ایمیل مجاز نیست"),
    mobile: Joi.string()
        .regex(/^[0-9]{11}$/)
        .when("signUpMethod", { is: "mobile", then: Joi.required() }).label("شماره تلفن مجاز نیست"),
    email: Joi.string().email().when("signUpMethod", { is: "email", then: Joi.required() }).label("ایمیل مجاز نیست"),
    password: Joi.string().min(8).max(16).required().label("رمز عبور باید بین 8 الی 16 رقم باشد"),
    confirmPassword: Joi.ref("password"),
});

const checkOtpValidatorSchema = Joi.object({
    signUpMethod: Joi.string().required().valid("mobile", "email").label("روش ارسال کد اجباری است"),
    mobile: Joi.string()
        .regex(/^[0-9]{11}$/)
        .when("signUpMethod", { is: "mobile", then: Joi.required() }).label("شماره تلفن مجاز نیست"),
    email: Joi.string().email().when("signUpMethod", { is: "email", then: Joi.required() }).label("ایمیل مجاز نیست"),
    code: Joi.string().min(5).max(6).required().label("کد باید 5 رقمی باشد"),
});

module.exports = { sendOtpValidatorSchema, checkOtpValidatorSchema };
