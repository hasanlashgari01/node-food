const Joi = require("joi");

const sendOtpValidatorSchema = Joi.object({
    fullName: Joi.string().min(8).max(30).required(),
    signUpMethod: Joi.string().required().valid("mobile", "email"),
    mobile: Joi.string()
        .regex(/^[0-9]{11}$/)
        .when("signUpMethod", { is: "mobile", then: Joi.required() }),
    email: Joi.string().email().when("signUpMethod", { is: "email", then: Joi.required() }),
    password: Joi.string().min(8).max(16).required(),
    confirmPassword: Joi.ref("password"),
});

module.exports = { sendOtpValidatorSchema };
