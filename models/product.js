const mongoose = require("mongoose");

var ProductSchema = new mongoose.Schema({
  imagePath: { type: String, required: true },
  name: { type: String, required: true },
  category: { type: String, required: true },
  description: { type: String },
  bundles: [
    {
      unit: { type: String, required: true },
      price: { type: Number, required: true }
    }
  ]
});

module.exports = mongoose.model("Product", ProductSchema);
