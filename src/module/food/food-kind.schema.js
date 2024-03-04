const { Schema, model, models } = require("mongoose");

const KindOfFoodSchema = new Schema({
    foods: [
        {
            title: { type: String, required: true },
            price: { type: Number, required: true },
            discount: { type: Number, default: 0, min: 0, max: 100 },
            weight: { type: Number, required: true },
        },
    ],
});

const KindOfFoodModel = models.KindOfFood || model("KindOfFood", KindOfFoodSchema);

module.exports = KindOfFoodModel;
