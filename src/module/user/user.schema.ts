import { Document, Schema, model, models } from "mongoose";

interface OtpSchemaType {
    code: string;
    expiresIn: number;
    isActive: boolean;
    maxAttempts: number;
    maxAttemptsExpiresIn: number;
}

export interface UserSchemaType extends Document {
    fullName: string;
    mobile: string;
    email: string;
    verifiedAccount: boolean;
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
