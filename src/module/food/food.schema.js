const { Schema, model, models } = require("mongoose");
const ObjectId = Schema.Types.ObjectId;

const DiscountSchema = new Schema({
    percent: { type: Number, default: 0, min: 0, max: 100 },
    startDate: { type: Date, default: Date.now }, // now
    endDate: { type: Date, default: () => new Date(+new Date() + 24 * 60 * 60 * 1000) }, // tomorrow
    amount: { type: Number },
});

const FoodSchema = new Schema({
    title: { type: String, required: true },
    image: { type: String },
    description: { type: String, required: true },
    rate: { type: Number, required: true, default: 0 },
    price: { type: Number, required: true, default: 0 },
    weight: { type: Number, required: true },
    // restaurantId: { type: ObjectId, ref: "Restaurant", required: true },
    menuId: { type: ObjectId, ref: "Menu", required: true },
    kindId: { type: [ObjectId], ref: "KindOfFood" },
    discount: DiscountSchema,
});

const FoodModel = models.Food || model("Food", FoodSchema);

module.exports = FoodModel;
