const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema({
  personalInfo: {
    preferredLanguage: String,
    firstName: { type: String, required: true },
    middleName: String,
    lastName: { type: String, required: true },
    secondLastName: String,
    email: String,
    phone: String,
    dateOfBirth: Date,
    gender: String,
    maritalStatus: String,
    countryOfBirth: String,
    weight: String,
    height: String,
    tobaccoUser: Boolean,
    pregnant: Boolean,
  },
  employment: [
    {
      employer: String,
      phone: String,
      occupation: String,
      annualIncome: Number,
    }
  ],
  immigrationStatus: {
    status: String,
    category: String,
    passportNumber: String,
    uscisNumber: String,
    ssn: String,
    ssnIssueDate: Date,
    greenCardNumber: String,
    greenCardExpiry: Date,
    workPermitNumber: String,
    workPermitExpiry: Date,
    driverLicenseNumber: String,
    driverLicenseExpiry: Date,
  },
  physicalAddress: {
    addressLine1: String,
    addressLine2: String,
    city: String,
    state: String,
    zipCode: String,
    county: String,
  },
  mailingAddress: {
    sameAsPhysical: Boolean,
    addressLine1: String,
    addressLine2: String,
    city: String,
    state: String,
    zipCode: String,
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Client', clientSchema);
