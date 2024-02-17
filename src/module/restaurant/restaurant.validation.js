const Joi = require("joi");

const RestaurantValidator = Joi.object({
    name: Joi.string().min(3).max(255).required().label("مقدار عنوان معتبر نیست"),
    logo: Joi.string().required().label("لوگو معتبر نیست"),
    cover: Joi.string().required().label("عکس معتبر نیست"),
    phone: Joi.string()
        .regex(/^[0-9]{11}$/)
        .required()
        .label("شماره تلفن معتبر نیست"),
    email: Joi.string().email().required().label("ایمیل مجاز نیست"),
    province: Joi.string().required().label("استان معتبر نیست"),
    order_start: Joi.number().required().label("تاریخ شروع کاری معتبرر نیست"),
    order_end: Joi.number().required().label("تاریخ پایان کاری معتبرر نیست"),
    average_delivery_time: Joi.number().required().label("میانگین زمان ارسال معتبر نیست"),
    types: Joi.array().items(Joi.string()).required().label("نوع دسته بندی معتبر نیست"),
});

module.exports = { RestaurantValidator };
