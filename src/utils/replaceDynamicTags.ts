type ClientData = {
  name?: string;
  dob?: string;
  phone?: string;
  email?: string;
  ssn?: string;
  physicalAddress?: { street?: string; city?: string; state?: string; zip?: string };
  mailingAddress?: { street?: string; city?: string; state?: string; zip?: string };
};

type AgentData = {
  name?: string;
  npn?: string;
  email?: string;
  phone?: string;
};

type DynamicData = {
  client?: ClientData;
  agent?: AgentData;
};

export const replaceDynamicTags = (template: string, data: DynamicData): string => {
  let result = template;

  // Client Tags
  const client = data.client || {};
  const physical = client.physicalAddress || {};
  const mailing = client.mailingAddress || {};

  result = result.replaceAll('{{client_name}}', client.name || '');
  result = result.replaceAll('{{client_dob}}', client.dob || '');
  result = result.replaceAll('{{client_phone}}', client.phone || '');
  result = result.replaceAll('{{client_email}}', client.email || '');
  result = result.replaceAll('{{client_ssn}}', maskSSN(client.ssn));
  result = result.replaceAll(
    '{{client_physical_address}}',
    formatAddress(physical)
  );
  result = result.replaceAll(
    '{{client_mailing_address}}',
    formatAddress(mailing)
  );

  // Agent Tags
  const agent = data.agent || {};
  result = result.replaceAll('{{agent_name}}', agent.name || '');
  result = result.replaceAll('{{agent_npn}}', agent.npn || '');
  result = result.replaceAll('{{agent_email}}', agent.email || '');
  result = result.replaceAll('{{agent_phone}}', agent.phone || '');

  // System Tags
  const now = new Date();
  result = result.replaceAll('{{current_year}}', now.getFullYear().toString());
  result = result.replaceAll('{{current_date}}', now.toLocaleDateString());

  return result;
};

const formatAddress = (address: any) => {
  const parts = [address.street, address.city, address.state, address.zip].filter(Boolean);
  return parts.join(', ');
};

const maskSSN = (ssn?: string) => {
  if (!ssn || ssn.length < 4) return '';
  return `XXX-XX-${ssn.slice(-4)}`;
};
