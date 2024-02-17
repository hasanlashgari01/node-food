const { Schema, model, models } = require("mongoose");
const ObjectId = Schema.Types.ObjectId;

const KindOfFoodSchema = new Schema({
    title: { type: String, required: true },
    price: { type: Number, required: true },
    weight: { type: Number, required: true },
});

const FoodSchema = new Schema({
    title: { type: String, required: true },
    image: { type: String },
    description: { type: String, required: true },
    rate: { type: Number, required: true, default: 0 },
    menuId: { type: ObjectId, ref: "Menu", required: true },
    kind: { type: [KindOfFoodSchema] },
});

const FoodModel = models.Food || model("Food", FoodSchema);

module.exports = FoodModel;
