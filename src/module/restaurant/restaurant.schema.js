const { Schema, model, models } = require("mongoose");
const ObjectId = Schema.Types.ObjectId;

const CommentsOfRestaurantSchema = new Schema(
    {
        name: { type: String },
        logo: { type: String },
        cover: { type: String },
        phone: { type: String, unique: true },
        email: { type: String, unique: true },
        score: { type: String, default: 0 },
        province: { type: String, required: true },
        order: { start: { type: Number }, end: { type: Number } },
        details: {
            average_delivery_time: { type: Number, default: 0 },
            send_outside_city: { type: Boolean, default: false },
        },
        category: { type: [String], default: [] },
        isValid: { type: Boolean, default: false },
        author: { type: ObjectId, ref: "User", required: true },
    },
    { timestamps: true }
);

const RestaurantModel = models.CommentsOfRestaurant || model("CommentsOfRestaurant", CommentsOfRestaurantSchema);

module.exports = RestaurantModel;
