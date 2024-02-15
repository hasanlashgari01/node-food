const { Schema, model, models, Types } = require("mongoose");
const { populate } = require("dotenv");

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
        ref: "Category"
    },
    parents: {
        type: [Types.ObjectId],
        ref: "Category",
        default: []
    }
}, { versionKey: false, id: false, toJSON: { virtuals: true } });

CategorySchema.virtual("children", {
    ref: "Category",
    localField: "_id",
    foreignField: "parent"
});

function autoPopulate(next) {
    this.populate([{ path: "children" }]);
    next();
}

CategorySchema.pre("find", autoPopulate).pre("findOne", autoPopulate);

const CategoryModel = models.Category || model("Category", CategorySchema);

module.exports = CategoryModel;
