const { Schema, model, models } = require("mongoose");

const OtpSchema = new Schema({
    code: {
        type: String,
        required: false,
        default: undefined,
    },
    expiresIn: {
        type: Number,
        required: false,
        default: 0,
    },
    isActive: {
        type: Boolean,
        required: false,
        default: false,
    },
    maxAttempts: {
        type: Number,
        required: false,
        default: 3,
    },
    maxAttemptsExpiresIn: {
        type: Number,
        required: false,
        default: 0,
    },
});

const UserSchema = new Schema(
    {
        fullName: {
            type: String,
        },
        mobile: {
            type: String,
            unique: true,
        },
        email: {
            type: String,
            unique: true,
        },
        password: {
            type: String,
            required: true,
        },
        role: {
            type: String,
            enum: ["ADMIN", "USER"],
            default: "USER",
            required: true,
        },
        age: {
            type: Number,
        },
        verifiedAccount: {
            type: Boolean,
            default: false,
        },
        otp: {
            type: OtpSchema,
        },
    },
    { timestamps: true }
);

const UserModel = models.User || model("User", UserSchema);

module.exports = UserModel;