const { Schema, model, models } = require("mongoose");
const ObjectId = Schema.Types.ObjectId;

const MenuSchema = new Schema({
    title: { type: String, required: true },
    image: { type: String, required: true },
    restaurantId: { type: ObjectId, ref: "Restaurant", required: true },
});

const MenuModel = models.Menu || model("Menu", MenuSchema);

module.exports = MenuModel;
