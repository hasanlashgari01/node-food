const Joi = require("joi");

const SuggestionMenuValidator = Joi.object({
    title: Joi.string().min(3).max(255).required().label("عنوان معتبر نیست"),
    image: Joi.string().label("عکس معتبر نیست"),
    slug: Joi.string().min(3).max(255).required().label("آدرس معتبر نیست")
});

const UpdateSuggestionMenuValidator = Joi.object({
    title: Joi.string().min(3).max(255).label("عنوان معتبر نیست"),
    image: Joi.string().label("عکس معتبر نیست"),
    slug: Joi.string().min(3).max(255).label("آدرس معتبر نیست")
});

module.exports = { SuggestionMenuValidator, UpdateSuggestionMenuValidator };