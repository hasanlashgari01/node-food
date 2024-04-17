const { Schema, model, models } = require("mongoose");
const ObjectId = Schema.Types.ObjectId;

const FoodCommentSchema = new Schema(
    {
        body: { type: String, required: true },
        rate: { type: Number, default: 0 },
        isAccepted: { type: Boolean, default: false },
        isAnswer: { type: Number, required: true, default: 0 },
        foodId: { type: ObjectId, ref: "Food", required: true },
        authorId: { type: ObjectId, ref: "User", required: true },
        mainCommentID: { type: ObjectId, ref: "FoodComment", default: null },
        likes: { type: [ObjectId], ref: "User", default: [] },
        isLiked: { type: Boolean, default: false },
    },
    { timestamps: true }
);

const FoodCommentsModel = models.FoodComment || model("FoodComment", FoodCommentSchema);

module.exports = FoodCommentsModel;
