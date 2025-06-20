const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  phone: String,
  createdBy: String
}, { timestamps: true });

module.exports = mongoose.model('Client', clientSchema);
