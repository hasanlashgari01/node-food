const Joi = require("joi");

const FoodValidator = Joi.object({
    title: Joi.string().min(3).max(255).required().label("عنوان معتبر نیست"),
    image: Joi.string().label("عکس معتبر نیست"),
    description: Joi.string().min(3).max(255).required().label("آدرس معتبر نیست"),
    menuId: Joi.string().required().label("شناسه منو معتبر نیست"),
    kind: Joi.array().items(
        Joi.object({
            title: Joi.string().min(3).max(255).required().label("عنوان غذا معتبر نیست"),
            price: Joi.number().required().label("قیمت معتبر نیست"),
            weight: Joi.number().required().label("وزن معتبر نیست"),
        })
    ),
});

const FoodUpdateValidator = Joi.object({
    title: Joi.string().min(3).max(255).label("عنوان معتبر نیست"),
    image: Joi.string().label("عکس معتبر نیست"),
    description: Joi.string().min(3).max(255).label("آدرس معتبر نیست"),
    menuId: Joi.string().required().label("شناسه منو معتبر نیست"),
    kind: Joi.array().items(
        Joi.object({
            title: Joi.string().min(3).max(255).label("عنوان غذا معتبر نیست"),
            price: Joi.number().label("قیمت معتبر نیست"),
            weight: Joi.number().label("وزن معتبر نیست"),
        })
    ),
});

module.exports = { FoodValidator, FoodUpdateValidator };
