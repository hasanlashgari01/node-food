const Joi = require("joi");

const MenuValidator = Joi.object({
    title: Joi.string().min(3).max(20).required().label("عنوان معتبر نیست"),
    slug: Joi.string().min(3).max(255).required().label("آدرس معتبر نیست"),
    restaurantId: Joi.string().required().label("شناسه رستوران معتبر نیست"),
});

const MenuUpdateValidator = Joi.object({
    title: Joi.string().min(3).max(255).label("عنوان معتبر نیست"),
    slug: Joi.string().min(3).max(255).label("آدرس معتبر نیست"),
});

module.exports = { MenuValidator, MenuUpdateValidator };
