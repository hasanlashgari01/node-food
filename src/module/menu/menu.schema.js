const { Schema, model, models } = require("mongoose");

const MenuSchema = new Schema({
    title: { type: String, required: true },
    image: { type: String, required: true },
});

const MenuModel = models.Menu || model("Menu", MenuSchema);

module.exports = MenuModel;
