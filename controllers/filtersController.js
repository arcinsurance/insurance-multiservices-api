
const Client = require('../models/Client');
const Policy = require('../models/Policy');

exports.getAllFilters = async (req, res) => {
  try {
    const agents = await Client.distinct('agent');
    const languages = await Client.distinct('language');
    const birthMonths = Array.from({ length: 12 }, (_, i) => i + 1);
    const genders = await Client.distinct('gender');
    const states = await Client.distinct('state');
    const zipCodes = await Client.distinct('zipCode');
    const immigrationStatuses = await Client.distinct('immigrationStatus');
    const leadStatuses = await Client.distinct('leadStatus');
    const carriers = await Policy.distinct('carrier');
    const productTypes = await Policy.distinct('productType');
    const policyStatuses = await Policy.distinct('status');
    const signatureStatuses = await Client.distinct('signatureStatus');
    const forms = await Client.distinct('form');

    res.json({
      agents,
      languages,
      birthMonths,
      genders,
      states,
      zipCodes,
      immigrationStatuses,
      leadStatuses,
      carriers,
      productTypes,
      policyStatuses,
      signatureStatuses,
      forms,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching filters' });
  }
};
