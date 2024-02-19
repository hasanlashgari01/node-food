const { Schema, model, models } = require("mongoose");

const MenuSuggestionSchema = new Schema({
    title: { type: String, required: true, unique: true },
    image: { type: String, required: true },
    slug: { type: String, required: true, unique: true }
});

const MenuSuggestionModel = model("Menu-Suggestion", MenuSuggestionSchema);

module.exports = MenuSuggestionModel;
