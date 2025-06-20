
const mongoose = require('mongoose');

const policySchema = new mongoose.Schema({
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client'
  },
  carrier: String,
  productType: String,
  status: String,
  effectiveDate: Date,
  createdDate: Date
});

module.exports = mongoose.model('Policy', policySchema);
