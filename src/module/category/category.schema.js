const { Schema, model, models } = require("mongoose");
const ObjectId = Schema.Types.ObjectId;

const CategorySchema = new Schema(
    {
        title: { type: String, required: true },
        slug: { type: String, required: true, index: true },
        icon: { type: String, required: true },
        parent: { type: ObjectId, ref: "Category" },
        parents: { type: [ObjectId], ref: "Category", default: [] },
    },
    { versionKey: false, id: false, toJSON: { virtuals: true } }
);

CategorySchema.virtual("children", {
    ref: "Category",
    localField: "_id",
    foreignField: "parent",
});

function autoPopulate(next) {
    this.populate([{ path: "children" }]);
    next();
}

CategorySchema.pre("find", autoPopulate).pre("findOne", autoPopulate);

const CategoryModel = models.Category || model("Category", CategorySchema);

module.exports = CategoryModel;
