const mongoose = require("mongoose");

const CategorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true }, // Category name (Food, Travel, etc.)
});

module.exports = mongoose.model("Category", CategorySchema);
