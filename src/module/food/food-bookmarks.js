const { Schema, model, models } = require("mongoose");
const ObjectId = Schema.Types.ObjectId;

const FoodBookmarksSchema = new Schema(
    {
        userId: { type: ObjectId, ref: "User", required: true },
        foodId: { type: ObjectId, ref: "Food", required: true },
    },
    { timestamps: true }
);

const FoodBookmarksModel =
    models.Food_Bookmarks || model("Food_Bookmarks", FoodBookmarksSchema);

module.exports = FoodBookmarksModel;
