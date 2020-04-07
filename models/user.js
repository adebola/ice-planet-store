const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const saltRounds = 10;

var UserSchema = new mongoose.Schema ({
  email: {type: String, unique: true, required: true},
  password: {type: String, required: true},
  isVerified: {type: Boolean, required: true, default: false},
  fullName: {type: String, required: true},
  telephoneNumber: {type: String},
  address: {type: String},
  creditUser:{type: Boolean, required: true, default: false},
  organization: {type: String},
  avatarImage: {type: String},
  passwordResetToken: {type: String},
  passwordResetExpires: {type: Date}
});

UserSchema.methods.encryptPassword = (password, callback) => {
  bcrypt.hash(password, saltRounds, (err, hash) => {
    callback(err, hash);
  });
};

UserSchema.methods.validPassword = (password, encryptedPassword, callback) => {
  bcrypt.compare(password, encryptedPassword, (err, res) => {
    callback(err, res);
  });
}

module.exports = mongoose.model("User", UserSchema);