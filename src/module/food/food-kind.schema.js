const { Schema, model, models } = require("mongoose");
const ObjectId = Schema.Types.ObjectId;

const KindOfFoodSchema = new Schema({
    foods: [
        {
            title: { type: String, required: true },
            price: { type: Number, required: true },
            weight: { type: Number, required: true },
        },
    ],
});

const KindOfFoodModel = models.KindOfFood || model("KindOfFood", KindOfFoodSchema);

module.exports = KindOfFoodModel;
