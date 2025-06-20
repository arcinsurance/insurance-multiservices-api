const mongoose = require('mongoose');

const agentSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  hasChangedInitialPassword: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Agent', agentSchema);
