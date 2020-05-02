const mongoose = require('mongoose');

var CommentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  telephone: {type: String, required: true},
  message: { type: String, required: true },
  date: { type: Date, default: Date.now, required: true },
  response: {type: Boolean, default: false, required: true}
});

module.exports = mongoose.model("Comment", CommentSchema);
