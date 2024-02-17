const { Schema, model, models, Types } = require("mongoose");
const ObjectId = Schema.Types.ObjectId;

const FoodSchema = new Schema({
    title: { type: String, required: true },
    image: { type: String, required: true },
    description: { type: String, required: true },
    rate: { type: Number, required: true },
    menuId: { type: ObjectId, ref: "Menu", required: true },
    kind: {
        type: [
            {
                _id: { type: ObjectId, required: true },
                title: { type: String, required: true },
                price: { type: Number, required: true },
                weight: { type: Number, required: true },
            },
        ],
    },
});

const FoodModel = models.Food || model("Food", FoodSchema);

module.exports = FoodModel;
