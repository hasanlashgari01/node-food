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
            required: true,
        },
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
            required: false,
        },
        verifiedAccount: {
            type: Boolean,
            default: false,
            required: true,
        },
        otp: {
            type: OtpSchema,
        },
    },
    { timestamps: true }
);

const UserModel = models.User || model("User", UserSchema);

module.exports = UserModel;
