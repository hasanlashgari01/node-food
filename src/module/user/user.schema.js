const { Schema, model, models } = require("mongoose");
const ObjectId = Schema.Types.ObjectId;

const OtpSchema = new Schema({
    code: { type: String, required: false, default: undefined },
    expiresIn: { type: Number, required: false, default: 0 },
    isActive: { type: Boolean, required: false, default: false },
    maxAttempts: { type: Number, required: false, default: 3 },
    maxAttemptsExpiresIn: { type: Number, required: false, default: 0 },
});

const ProductSchema = new Schema({
    quantity: { type: Number, default: 1 },
    productId: { type: ObjectId, ref: "Product" },
});

const CartSchema = new Schema({
    products: { type: [ProductSchema], default: [] },
    coupon: { type: ObjectId, ref: "Coupon", default: null },
});

const UserSchema = new Schema(
    {
        fullName: { type: String },
        avatar: { type: String },
        biography: { type: String, default: null },
        mobile: { type: String, unique: true, trim: true, default: null },
        isVerifiedMobile: { type: Boolean, default: false },
        email: { type: String, unique: true, lowercase: true, trim: true, default: null },
        password: { type: String, required: true },
        role: { type: String, enum: ["ADMIN", "USER", "SELLER"], default: "USER", required: true },
        restaurants: { type: [ObjectId], ref: "Restaurant" },
        age: { type: Number },
        verifiedAccount: { type: Boolean, default: false },
        otp: { type: OtpSchema },
        likedFoods: [{ type: ObjectId, ref: "Food" }],
        bookmarkedFoods: [{ type: ObjectId, ref: "Food" }],
        likedRestaurants: [{ type: ObjectId, ref: "Restaurant" }],
        bookmarkedRestaurants: [{ type: ObjectId, ref: "Restaurant" }],
        resetLink: { type: String, default: null },
        foods: [{ type: ObjectId, ref: "Food" }],
        cart: { type: CartSchema },
    },
    { timestamps: true, toJSON: { virtuals: true } }
);

UserSchema.virtual("avatarUrl").get(function () {
    if (this.avatar) return `${process.env.SERVER_URL}/${this.avatar}`;
    return null;
});

UserSchema.methods.toJSON = function () {
    const obj = this.toObject();
    obj.avatarUrl = this.avatarUrl;
    delete obj.password;
    delete obj.avatar;
    return obj;
};

const UserModel = models.User || model("User", UserSchema);

module.exports = UserModel;
