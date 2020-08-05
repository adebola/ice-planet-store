const mongoose = require("mongoose");

var OrderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  cart: { type: Object, required: true },
  paymentId: { type: String },
  date: { type: Date, default: Date.now, required: true },
  delivery : {type: Number, default: 0, required: true},
  paymentVerified: {type: Boolean, default: false, required: true},
  fulfilled: { type: Boolean, default: false, required: true},
  grandTotal: {type: Number, default: 0, required: true},
  cut: {type: Boolean, default: false, required: true},
  instruction: {type: String}
});

module.exports = mongoose.model("Order", OrderSchema);
