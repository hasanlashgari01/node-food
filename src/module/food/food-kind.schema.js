const { Schema, model, models } = require("mongoose");
const ObjectId = Schema.Types.ObjectId;

const KindOfFoodSchema = new Schema({
    title: { type: String, required: true },
    price: { type: Number, required: true },
    discount: { type: Number, default: 0, min: 0, max: 100 },
    weight: { type: Number, required: true },
    restaurantId: { type: ObjectId, ref: "Restaurant", required: true },
    foodId: { type: ObjectId, ref: "Food" },
});

const KindOfFoodModel = models.KindOfFood || model("KindOfFood", KindOfFoodSchema);

module.exports = KindOfFoodModel;
