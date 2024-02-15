const { Schema, model, models, Types } = require("mongoose");

const CategorySchema = new Schema({
    title: {
        type: String,
        required: true
    },
    slug: {
        type: String,
        required: true,
        index: true
    },
    icon: {
        type: String,
        required: true
    },
    parent: {
        type: Types.ObjectId,
        ref: "Category",
    },
    parents: {
        type: [Types.ObjectId],
        ref: "Category",
        default: []
    }
}, { virtuals: true, versionKey: false, id: false });

CategorySchema.virtual("children", {
    ref: "Category",
    localField: "_id",
    foreignField: "parent"
});

const CategoryModel = models.Category || model("Category", CategorySchema);

module.exports = CategoryModel;
