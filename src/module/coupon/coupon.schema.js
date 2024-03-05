const { Schema, model, models } = require("mongoose");
const ObjectId = Schema.Types.ObjectId;

const CouponSchema = new Schema(
    {
        code: { type: String, required: true, unique: true },
        type: { type: String, required: true, default: "fixedProduct", enum: ["fixedProduct", "percent"] },
        amount: { type: Number, required: true },
        status: { type: String, required: true, default: "active", enum: ["notActive", "active", "expired"] },
        startDate: { type: Date, default: Date.now },
        expireDate: { type: Date, default: () => new Date(Date.now() + 24 * 60 * 60 * 1000) },
        usageCount: { type: Number, default: 1 },
        usageLimit: { type: Number, required: true, default: 1 },
        creator: { type: ObjectId, ref: "User", required: true },
        foodIds: { type: [ObjectId], ref: "Food", default: [] },
        userIds: { type: [ObjectId], ref: "User", default: [] },
    },
    { timestamps: true }
);

const CouponModel = models.Coupon || model("Coupon", CouponSchema);

module.exports = CouponModel;
