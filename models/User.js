const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: String,
  password: String,
  otpCode: String,
  otpExpiresAt: Date,
  lastPasswordChange: Date
});

module.exports = mongoose.model('User', userSchema);
