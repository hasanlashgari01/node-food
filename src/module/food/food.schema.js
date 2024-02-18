const { Schema, model, models } = require("mongoose");
const ObjectId = Schema.Types.ObjectId;

const FoodSchema = new Schema({
    title: { type: String, required: true },
    image: { type: String },
    description: { type: String, required: true },
    rate: { type: Number, required: true, default: 0 },
    menuId: { type: ObjectId, ref: "Menu", required: true },
    kindId: { type: ObjectId, ref: "KindOfFood", required: true },
});

function autoPopulate(next) {
    this.populate("kindId", "-__v");
    next();
}

FoodSchema.pre("find", autoPopulate).pre("findOne", autoPopulate);

const FoodModel = models.Food || model("Food", FoodSchema);

module.exports = FoodModel;
