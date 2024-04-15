const { Schema, model, models } = require("mongoose");
const ObjectId = Schema.Types.ObjectId;

const CommentLikesSchema = new Schema(
    {
        userId: { type: ObjectId, ref: "User", required: true },
        commentId: { type: ObjectId, ref: "FoodComment", required: true },
    },
    { timestamps: true }
);

const FoodCommentLikesModel = models.Food_Comment_Likes || model("Food_Comment_Likes", CommentLikesSchema);

module.exports = FoodCommentLikesModel;
