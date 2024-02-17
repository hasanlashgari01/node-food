const { Schema, model, models } = require("mongoose");

const ServiceHourSchema = new Schema({
    required: false,
    start: { type: String },
    end: { type: String },
});

const ServiceHoursSchema = new Schema({
    day: {
        type: String,
        enum: ["شنبه", "یکشنبه", "دوشنبه", "سه شنبه", "چهارشنبه", "پنجشنبه", "جمعه"],
        required: true,
    },
    breakfast: { type: ServiceHourSchema },
    lunch: { type: ServiceHourSchema },
    dinner: { type: ServiceHourSchema },
});

const RestaurantSchema = new Schema(
    {
        name: { type: String },
        logo: { type: String },
        cover: { type: String },
        phone: { type: String, unique: true },
        email: { type: String, unique: true },
        score: { type: String, default: 0 },
        location: { type: String, required: true },
        order: { start: { type: Number }, end: { type: Number } },
        details: {
            average_delivery_time: { type: Number, default: 0 },
            send_outside_city: { type: Boolean, default: false },
            types: { type: [String], default: [] },
        },
        service_hours: { type: [ServiceHoursSchema], default: [] },
    },
    { timestamps: true }
);

const RestaurantModel = models.Restaurant || model("Restaurant", RestaurantSchema);

module.exports = RestaurantModel;
