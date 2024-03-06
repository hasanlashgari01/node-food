const { Schema, model, models } = require("mongoose");
const ObjectId = Schema.Types.ObjectId;

const DiscountSchema = new Schema({
    percent: { type: Number, default: 0, min: 0, max: 100 },
    startDate: { type: Date, default: Date.now }, // now
    endDate: { type: Date, default: () => new Date(+new Date() + 24 * 60 * 60 * 1000) }, // tomorrow
    amount: { type: Number },
});

const KindOfFoodSchema = new Schema({
    title: { type: String, required: true },
    price: { type: Number, required: true },
    weight: { type: Number, required: true },
    restaurantId: { type: ObjectId, ref: "Restaurant", required: true },
    foodId: { type: ObjectId, ref: "Food" },
    discount: DiscountSchema,
});

const KindOfFoodModel = models.KindOfFood || model("KindOfFood", KindOfFoodSchema);

module.exports = KindOfFoodModel;
