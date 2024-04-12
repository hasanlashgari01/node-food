const { Schema, model, models } = require("mongoose");
const ObjectId = Schema.Types.ObjectId;

const FoodLikesSchema = new Schema(
    {
        userId: { type: ObjectId, ref: "User", required: true },
        foodId: { type: ObjectId, ref: "Food", required: true },
    },
    { timestamps: true }
);

const FoodLikesModel = models.Food_Likes || model("Food_Likes", FoodLikesSchema);

module.exports = FoodLikesModel;
