const Joi = require("joi");

const CreateCouponValidator = Joi.object({
    code: Joi.string().min(3).max(255).required().label("کد کوپن معتبر نیست"),
    type: Joi.string().valid("fixedProduct", "percent").required().label("نوع کوپن معتبر نیست"),
    amount: Joi.number()
        .when("type", {
            is: "fixedProduct",
            then: Joi.required().label("مقدار معتبر نیست"),
        })
        .when("type", {
            is: "percent",
            then: Joi.number().min(1).max(100).required().label("مقدار تخفیف باید بین 1 تا 100 باشد"),
        }),
    status: Joi.string().valid("active", "notActive", "expired").label("وضعیت کوپن معتبر نیست"),
    startDate: Joi.date().label("فقط تاریخ معتبر می باشد"),
    expireDate: Joi.date().label("فقط تاریخ معتبر می باشد"),
    usageCount: Joi.number().min(1).label("تعداد استفاده معتبر نیست"),
    usageLimit: Joi.number().min(1).label("تعداد استفاده معتبر نیست"),
    foodIds: Joi.array().items(Joi.string()).label("شناسه ها معتبر نیست"),
    userIds: Joi.array().items(Joi.string()).label("شناسه ها معتبر نیست"),
});

module.exports = { CreateCouponValidator };
