const mongoose = require('mongoose');

var BundleSchema = new mongoose.Schema({
  name : {type: String, required: true},
  title : {type: String, required: true},
  price: {type: Number, required: true}
});

module.exports = mongoose.model("Bundle", BundleSchema);