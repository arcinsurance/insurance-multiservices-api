
const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema({
  name: String,
  agent: String,
  language: String,
  birthDate: Date,
  gender: String,
  state: String,
  zipCode: String,
  immigrationStatus: String,
  leadStatus: String,
  signatureStatus: String,
  form: String
});

module.exports = mongoose.model('Client', clientSchema);
