const mongoose = require("mongoose");

var MailSchema = new mongoose.Schema({
  to: { type: String, required: true },
  from: { type: String, required: true },
  subject: {type: String, required: true},
  content: { type: String, required: true },
  date: { type: Date, default: Date.now, required: true },
  mailId: { type: String }
});

module.exports = mongoose.model("Mail", MailSchema);
