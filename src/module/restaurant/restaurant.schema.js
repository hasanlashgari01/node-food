const { Schema, model, models } = require("mongoose");
const ObjectId = Schema.Types.ObjectId;

const RestaurantSchema = new Schema(
    {
        name: { type: String },
        logo: { type: String },
        cover: { type: String },
        phone: { type: String, unique: true },
        email: { type: String, unique: true },
        slug: { type: String, unique: true, lowercase: true },
        score: { type: String, default: 0 },
        province: {
            name: { type: String },
            englishTitle: { type: String, unique: true, lowercase: true, trim: true },
        },
        order: { start: { type: Number }, end: { type: Number } },
        details: {
            average_delivery_time: { type: Number, default: 0 },
            send_outside_city: { type: Boolean, default: false },
        },
        categories: { type: [ObjectId], ref: "Categories", default: [] },
        isValid: { type: Boolean, default: false },
        author: { type: ObjectId, ref: "User", required: true },
    },
    { timestamps: true }
);

const RestaurantModel = models.Restaurant || model("Restaurant", RestaurantSchema);

module.exports = RestaurantModel;
