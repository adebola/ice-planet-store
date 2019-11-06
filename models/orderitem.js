const mongoose = require('mongoose');
  
var OrderItemSchema = new mongoose.Schema({
  item: {type: mongoose.Schema.Types.ObjectId, ref: 'Product'},
  unit: { type: String, required: true},
  unitprice: {type: Number, required: true},
  qty: {type: Number, default: 1, required: true}
});

module.exports = mongoose.model("OrderItem", OrderItemSchema);