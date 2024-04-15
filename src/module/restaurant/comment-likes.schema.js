const { Schema, model, models } = require("mongoose");
const ObjectId = Schema.Types.ObjectId;

const CommentLikesSchema = new Schema(
    {
        userId: { type: ObjectId, ref: "User", required: true },
        commentId: { type: ObjectId, ref: "RestaurantComment", required: true },
    },
    { timestamps: true }
);

const RestaurantCommentLikesModel = models.Restaurant_Comment_Likes || model("Restaurant_Comment_Likes", CommentLikesSchema);

module.exports = RestaurantCommentLikesModel;
