const Joi = require("joi");

const FoodValidator = Joi.object({
    title: Joi.string().min(3).max(255).required().label("عنوان معتبر نیست"),
    image: Joi.object().required().label("عکس معتبر نیست"),
    description: Joi.string().min(3).max(255).required().label("آدرس معتبر نیست"),
    menuId: Joi.string().required().label("شناسه منو معتبر نیست"),
    price: Joi.number().required().label("قیمت معتبر نیست"),
    weight: Joi.number().required().label("وزن معتبر نیست"),
    percent: Joi.number().min(1).max(100).label("مقدار تخفیف باید بین 1 تا 100 باشد"),
    startDate: Joi.date().allow().label("تاریخ شروع تخفیف معتبر نیست"),
    endDate: Joi.date().allow().label("تاریخ پایان تخفیف معتبر نیست"),
    amount: Joi.number().label("مقدار تخفیف معتبر نیست"),
});

const FoodUpdateValidator = Joi.object({
    title: Joi.string().required().min(3).max(255).label("عنوان معتبر نیست"),
    image: Joi.string().label("عکس معتبر نیست"),
    description: Joi.string().required().min(3).max(255).label("آدرس معتبر نیست"),
    menuId: Joi.string().required().label("شناسه منو معتبر نیست"),
    price: Joi.number().required().label("قیمت معتبر نیست"),
    weight: Joi.number().required().label("وزن معتبر نیست"),
    percent: Joi.number().optional().min(1).max(100).label("مقدار تخفیف باید بین 1 تا 100 باشد"),
    startDate: Joi.date().optional().label("تاریخ شروع تخفیف معتبر نیست"),
    endDate: Joi.date().optional().label("تاریخ پایان تخفیف معتبر نیست"),
    amount: Joi.number().required().label("مقدار تخفیف معتبر نیست"),
});

module.exports = { FoodValidator, FoodUpdateValidator };
