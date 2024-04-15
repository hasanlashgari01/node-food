const { Schema, model, models } = require("mongoose");
const ObjectId = Schema.Types.ObjectId;

const OrderSchema = new Schema(
    {
        orderId: { type: ObjectId, required: false },
        user: { type: ObjectId, ref: "User", required: true },
        foods: { type: [ObjectId], ref: "Food", required: true },
        total: { type: Number, required: true },
        mobile: { type: String, required: true },
        province: { type: String, required: false },
        address: { type: String, required: true },
        status: { type: String, enum: ["PENDING", "COMPLETED", "CANCELED"], default: "PENDING" },
        payment: { type: String, enum: ["CASH_ON_DELIVERY", "ONLINE"], default: "ONLINE" },
        paymentStatus: { type: String, enum: ["UNPAID", "PAID"], default: "UNPAID" },
        paymentDate: { type: Date, default: () => Date.now() },
        delivery: { type: String, enum: ["DELIVERY", "SELF_PICKUP"], default: "DELIVERY" },
        deliveryDate: { type: Date, default: () => Date.now() },
        deliveryStatus: { type: String, enum: ["PENDING", "COMPLETED", "CANCELED"], default: "PENDING" },
        coupon: { type: ObjectId, ref: "Coupon", default: null },
        couponAmount: { type: Number, default: 0 },
        discount: { type: Number, default: 0 },
        discountType: { type: String, enum: ["fixedProduct", "percent"], default: "fixedProduct" },
        orderDate: { type: Date, default: () => Date.now() },
        isExpired: { type: Boolean, default: false },
        timeToPay: { type: Date, default: () => Date.now() + 10 * 60 * 1000 }, // 10 minutes
        cancelDate: { type: Date },
    },
    { timestamps: true }
);

const OrderModel = models.Order || model("Order", OrderSchema);

module.exports = OrderModel;
