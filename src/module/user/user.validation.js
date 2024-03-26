const Joi = require("joi");

const UserValidator = Joi.object({
    avatar: Joi.any().required().label("عکس معتبر نیست"),
});

const UserUpdateValidator = Joi.object({
    title: Joi.string().min(3).max(255).label("عنوان معتبر نیست"),
    image: Joi.string().label("عکس معتبر نیست"),
    description: Joi.string().min(3).max(255).label("آدرس معتبر نیست"),
    menuId: Joi.string().required().label("شناسه منو معتبر نیست"),
});

module.exports = { UserValidator, UserUpdateValidator };
