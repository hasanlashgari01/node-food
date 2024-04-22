const { Schema, model, models } = require("mongoose");
const ObjectId = Schema.Types.ObjectId;

const CategorySchema = new Schema(
    {
        title: { type: String, required: true },
        slug: { type: String, required: true, index: true },
        icon: { type: String, required: false },
        parent: { type: ObjectId, ref: "Categories" },
        parents: { type: [ObjectId], ref: "Categories", default: [] },
    },
    { versionKey: false, id: false, toJSON: { virtuals: true } }
);

CategorySchema.virtual("children", {
    ref: "Categories",
    localField: "_id",
    foreignField: "parent",
});

function autoPopulate(next) {
    this.populate([{ path: "children" }]);
    next();
}

CategorySchema.pre("find", autoPopulate).pre("findOne", autoPopulate);

const CategoryModel = models.Category || model("Categories", CategorySchema);

module.exports = CategoryModel;
