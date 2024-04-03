const { Schema, model, models } = require("mongoose");
const ObjectId = Schema.Types.ObjectId;

const AddressSchema = new Schema({
    province: { type: String, required: false },
    city: { type: String, required: false },
    district: { type: String, required: false },
    detail: { type: String, required: false },
    coordinate: { type: [Number], required: false }, //51.215485487, 52.687524154
    mobile: { type: String, required: true },
    title: { type: String, required: false },
});

const UserAddressSchema = new Schema({
    userId: { type: ObjectId, ref: "User" },
    address: { type: [AddressSchema], default: [] },
});

const UserAddressModel = models.User_Address || model("User_Address", UserAddressSchema);

module.exports = UserAddressModel;
