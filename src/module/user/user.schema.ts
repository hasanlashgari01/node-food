import { Document, Schema, model, models } from "mongoose";

interface OtpSchemaType {
    code: string;
    expiresIn: number;
    maxAttempts: number;
    maxAttemptsExpiresIn: number;
}

export interface UserSchemaType extends Document {
    fullName: string;
    mobile: string;
    email: string;
    verifiedMobile: boolean;
    role: "ADMIN" | "USER";
    age: number;
    otp: OtpSchemaType;
}

const OtpSchema = new Schema({
    code: {
        type: String,
        required: false,
        default: undefined,
    },
    expiresIn: {
        type: Date,
        required: false,
        default: null,
    },
    maxAttempts: {
        type: Number,
        required: false,
        default: 3,
    },
    maxAttemptsExpiresIn: {
        type: Date,
        required: false,
        default: null,
    },
});

const UserSchema = new Schema(
    {
        fullName: {
            type: String,
            required: false,
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

const UserModel = models.User<UserSchemaType> || model<UserSchemaType>("User", UserSchema);

export default UserModel;
