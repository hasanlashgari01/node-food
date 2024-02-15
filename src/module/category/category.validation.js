const Joi = require("joi");

const createCategoryValidator = Joi.object({
    title: Joi.string().min(3).max(30).required().label("مقدار عنوان معتبر نیست"),
    slug: Joi.string().min(3).max(24).required().label("مقدار آدرس معتبر نیست"),
    icon: Joi.string().required().label("آیکون اجباری است"),
    parent: Joi.string(),
});

module.exports = { createCategoryValidator };
