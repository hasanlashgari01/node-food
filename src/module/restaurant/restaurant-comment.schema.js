const { Schema, model, models, Types } = require("mongoose");
const ObjectId = Schema.Types.ObjectId;

const RestaurantCommentsSchema = new Schema(
    {
        body: { type: String, required: true },
        rate: { type: Number, default: 0 },
        isAccepted: { type: Boolean, default: false },
        isAnswer: { type: Number, required: true, default: 0 },
        restaurantId: { type: ObjectId, ref: "Restaurant", required: true },
        authorId: { type: ObjectId, ref: "User", required: true },
        mainCommentID: { type: ObjectId, ref: "RestaurantComment", default: null },
        likes: { type: Number, default: 0 },
        isLiked: { type: Boolean, default: false },
    },
    { timestamps: true }
);

const RestaurantCommentsModel = models.RestaurantComment || model("RestaurantComment", RestaurantCommentsSchema);

module.exports = RestaurantCommentsModel;
