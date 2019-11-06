const mongoose = require("mongoose");

var OrderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  cart: { type: Object, required: true },
  paymentId: { type: String },
  date: { type: Date, default: Date.now, required: true }
});

module.exports = mongoose.model("Order", OrderSchema);
