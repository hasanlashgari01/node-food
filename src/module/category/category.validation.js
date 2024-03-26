const Joi = require("joi");

const CategoryValidator = Joi.object({
    title: Joi.string().min(3).max(30).required().label("مقدار عنوان معتبر نیست"),
    slug: Joi.string().min(3).max(24).required().label("مقدار آدرس معتبر نیست"),
});

module.exports = { CategoryValidator };
