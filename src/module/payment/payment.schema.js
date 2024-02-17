const { Schema, model, models } = require("mongoose");
const ObjectId = Schema.Types.ObjectId;

const PaymentSchema = new Schema({
    invoiceNumber: { type: String },
    paymentMethod: { type: String },
    amount: { type: Number },
    description: { type: String, default: "بابت خرید محصول" },
    status: { type: String, default: "UNCOMPLETED", enum: ["UNCOMPLETED", "COMPLETED"] },
    isPaid: { type: Boolean, default: false },
    user: { type: ObjectId, ref: "User", required: true },
    paymentDate: { type: String },
    cart: { type: Object, default: {} },
});

const PaymentModel = models.Payment || model("Payment", PaymentSchema);

module.exports = PaymentModel;
