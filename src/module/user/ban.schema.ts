import { Document, Schema, model, models } from "mongoose";

export interface BanUserSchemaType extends Document {
    mobile: string;
    email: string;
    createdAt: Date;
    updatedAt: Date;
}

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

const BanUserModel = models.BanUser<BanUserSchemaType> || model<BanUserSchemaType>("BanUser", BanUserSchema);

export default BanUserModel;
