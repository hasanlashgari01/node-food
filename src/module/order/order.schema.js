const { Schema, model, models } = require("mongoose");
const ObjectId = Schema.Types.ObjectId;

const OrderSchema = new Schema(
    {
        user: { type: ObjectId, ref: "User", required: true },
        foods: { type: [ObjectId], ref: "Food", required: true },
        total: { type: Number, required: true },
        province: { type: String, required: true },
        address: { type: String, required: true },
        status: { type: String, enum: ["PENDING", "COMPLETED", "CANCELED"], default: "PENDING" },
        payment: { type: String, enum: ["CASH_ON_DELIVERY", "ONLINE"], default: "CASH_ON_DELIVERY" },
        paymentStatus: { type: String, enum: ["UNPAID", "PAID"], default: "UNPAID" },
        paymentDate: { type: Date },
        deliveryDate: { type: Date },
        deliveryStatus: { type: String, enum: ["PENDING", "COMPLETED", "CANCELED"], default: "PENDING" },
        coupon: { type: ObjectId, ref: "Coupon", default: null },
        couponAmount: { type: Number, default: 0 },
        discount: { type: Number, default: 0 },
        discountType: { type: String, enum: ["fixedProduct", "percent"], default: "fixedProduct" },
        orderDate: { type: Date, default: () => Date.now().toLocaleDateString("fa-IR") },
    },
    { timestamps: true }
);

const OrderModel = models.Order || model("Order", OrderSchema);

module.exports = OrderModel;
