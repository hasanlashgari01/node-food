const { Schema, model, models } = require("mongoose");

const BanUserSchema = new Schema(
    {
        mobile: {
            type: String,
            unique: true,
            required: false,
        },
        email: {
            type: String,
            unique: true,
            required: false,
        },
    },
    { timestamps: true }
);

const BanUserModel = models.BanUser || model("BanUser", BanUserSchema);

module.exports = BanUserModel;
