const { Schema, model, models } = require("mongoose");
const ObjectId = Schema.Types.ObjectId;

const RestaurantLikesSchema = new Schema(
    {
        restaurantId: { type: ObjectId, ref: "Restaurant", required: true },
        userId: { type: ObjectId, ref: "User", required: true },
    },
    { timestamps: true }
);

const RestaurantLikesModel = models.Restaurant_Likes || model("Restaurant_Likes", RestaurantLikesSchema);

module.exports = RestaurantLikesModel;
