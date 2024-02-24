const { Schema, model, models } = require("mongoose");
const ObjectId = Schema.Types.ObjectId;

const CommentsOfFoodSchema = new Schema(
    {
        body: { type: String, required: true },
        rate: { type: Number, required: true },
        isAccepted: { type: Number, default: 0 },
        isAnswer: { type: Number, required: true, default: 0 },
        foodId: { type: ObjectId, ref: "Food", required: true },
        authorId: { type: ObjectId, ref: "User", required: true },
        mainCommentID: { type: ObjectId, ref: "FoodComment" },
        likes: { type: [ObjectId], ref: "User", default: [] },
    },
    { timestamps: true }
);

const FoodCommentsModel = models.CommentsOfFood || model("CommentsOfFood", CommentsOfFoodSchema);

module.exports = FoodCommentsModel;
