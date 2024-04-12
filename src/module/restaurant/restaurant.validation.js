const Joi = require("joi");

const RestaurantValidator = Joi.object({
    name: Joi.string().min(3).max(255).required().label("مقدار عنوان معتبر نیست"),
    logo: Joi.string().optional().label("لوگو معتبر نیست"),
    cover: Joi.string().optional().label("عکس معتبر نیست"),
    phone: Joi.string()
        .regex(/^[0-9]{11}$/)
        .required()
        .label("شماره تلفن معتبر نیست"),
    email: Joi.string().email().required().label("ایمیل مجاز نیست"),
});

const UpdateRestaurantValidator = Joi.object({
    name: Joi.string().min(3).max(255).required().label("مقدار عنوان معتبر نیست"),
    logo: Joi.string().optional().label("لوگو معتبر نیست"),
    cover: Joi.string().optional().label("عکس معتبر نیست"),
    provinceName: Joi.string().required().label("استان معتبر نیست"),
    order_start: Joi.number().required().label("تاریخ شروع کاری معتبرر نیست"),
    order_end: Joi.number().required().label("تاریخ پایان کاری معتبرر نیست"),
    average_delivery_time: Joi.number().required().label("میانگین زمان ارسال معتبر نیست"),
    send_outside_city: Joi.boolean().required().label("ارسال خارج شهر معتبر نیست"),
    categories: Joi.array().optional().label("دسته بندی معتبر نیست"),
});

const imageValidator = Joi.object({
    logo: Joi.string().optional().label("لوگو معتبر نیست"),
    cover: Joi.string().optional().label("عکس معتبر نیست"),
});

module.exports = { RestaurantValidator, UpdateRestaurantValidator };
