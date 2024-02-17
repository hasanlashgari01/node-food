const { Schema, model, models } = require("mongoose");
const ObjectId = Schema.Types.ObjectId;

const MenuSchema = new Schema({
    title: { type: String, required: true },
    image: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    restaurantId: { type: ObjectId, ref: "Restaurant", required: true },
    foods: { type: [ObjectId], ref: "Food", required: true },
});

const MenuModel = models.Menu || model("Menu", MenuSchema);

module.exports = MenuModel;
