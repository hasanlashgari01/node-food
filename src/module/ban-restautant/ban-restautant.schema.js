const { Schema, model, models } = require("mongoose");
const ObjectId = Schema.Types.ObjectId;

const BanRestaurantSchema = new Schema(
    {
        restaurantId: { type: ObjectId, ref: "Restaurant", unique: true, required: true }
    },
    { timestamps: true }
);

const BanRestaurantModel = models.BanRestaurant || model("BanRestaurant", BanRestaurantSchema);

module.exports = BanRestaurantModel;
