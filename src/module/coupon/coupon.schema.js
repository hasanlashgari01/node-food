const { Schema, model, models } = require("mongoose");
const ObjectId = Schema.Types.ObjectId;

const CouponSchema = new Schema(
    {
        code: { type: String, required: true, unique: true },
        type: { type: String, required: true, default: "fixedProduct", enum: ["fixedProduct", "percent"] },
        amount: { type: Number, required: true },
        expireDate: { type: Date, required: true, default: undefined },
        isActive: { type: Boolean, required: true, default: true },
        usageCount: { type: Number, required: true, default: 0 },
        usageLimit: { type: Number, required: true },
        foodIds: { type: [ObjectId], ref: "Food", default: [], required: true },
    },
    { timestamps: true }
);

const CouponModel = models.Coupon || model("Coupon", CouponSchema);

module.exports = CouponModel;
