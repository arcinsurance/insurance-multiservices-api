type DynamicData = {
  client: any;
  agent: any;
};

export const replaceDynamicTags = (template: string, data: DynamicData): string => {
  const { client, agent } = data;

  const maskedSSN = client?.ssn ? maskSSN(client.ssn) : '';

  const replacements: Record<string, string> = {
    '{{client_name}}': client?.name || '',
    '{{client_dob}}': client?.dob || '',
    '{{client_phone}}': client?.phone || '',
    '{{client_email}}': client?.email || '',
    '{{client_ssn}}': maskedSSN,
    '{{client_physical_address}}': formatAddress(client?.physicalAddress),
    '{{client_mailing_address}}': formatAddress(client?.mailingAddress),
    '{{agent_name}}': agent?.name || '',
    '{{agent_npn}}': agent?.npn || '',
    '{{agent_phone}}': agent?.phone || '',
    '{{agent_email}}': agent?.email || '',
    '{{policy_market_id}}': client?.policy_market_id || '',
    '{{current_year}}': new Date().getFullYear().toString(),
    '{{current_date}}': new Date().toISOString().split('T')[0],
  };

  let result = template;
  for (const [tag, value] of Object.entries(replacements)) {
    result = result.replaceAll(tag, value);
  }

  return result;
};

// Helper: Formatear dirección completa
const formatAddress = (address: any): string => {
  if (!address) return '';
  const parts = [
    address.street || '',
    address.city || '',
    address.state || '',
    address.zip || ''
  ].filter(Boolean);
  return parts.join(', ');
};

// Helper: Enmascarar SSN
const maskSSN = (ssn: string): string => {
  if (!ssn || ssn.length < 4) return '***-**-****';
  return `***-**-${ssn.slice(-4)}`;
};
