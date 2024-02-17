const { Schema, model, models } = require("mongoose");

const ProvinceSchema = new Schema({
    name: { type: String },
    englishTitle: { type: String, unique: true, lowercase: true, trim: true },
});

const ProvinceModel = models.Province || model("Province", ProvinceSchema);

module.exports = ProvinceModel;
