const { Schema, model, models } = require("mongoose");

const ProvinceSchema = new Schema({
    name: { type: String, trim: true, required: true },
    englishTitle: { type: String, unique: true, lowercase: true, trim: true },
});

const ProvinceModel = models.Province || model("Province", ProvinceSchema);

module.exports = ProvinceModel;
