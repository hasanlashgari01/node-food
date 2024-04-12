const { Schema, model, models } = require("mongoose");
const ObjectId = Schema.Types.ObjectId;

const RestaurantBookmarksSchema = new Schema(
    {
        userId: { type: ObjectId, ref: "User", required: true },
        restaurantId: { type: ObjectId, ref: "Restaurant", required: true },
    },
    { timestamps: true }
);

const RestaurantBookmarksModel =
    models.Restaurant_Bookmarks || model("Restaurant_Bookmarks", RestaurantBookmarksSchema);

module.exports = RestaurantBookmarksModel;
