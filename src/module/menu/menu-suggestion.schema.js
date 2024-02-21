const { Schema, model } = require("mongoose");

const SuggestionMenuSchema = new Schema({
    title: { type: String, required: true, unique: true },
    image: { type: String, required: true },
    slug: { type: String, required: true, unique: true }
});

const SuggestionMenuModel = model("Suggestion-Menu", SuggestionMenuSchema);

module.exports = SuggestionMenuModel;
