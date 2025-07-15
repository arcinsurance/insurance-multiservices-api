
export function replaceDynamicTags(template: string, data: any): string {
  let result = template;

  const client = data.client || {};
  const agent = data.agent || {};

  result = result.split('{{client_name}}').join(client.name || '');
  result = result.split('{{client_dob}}').join(client.dob || '');
  result = result.split('{{client_phone}}').join(client.phone || '');
  result = result.split('{{client_email}}').join(client.email || '');
  result = result.split('{{client_ssn}}').join(client.ssn || '');
  result = result.split('{{client_physical_address}}').join(
    client.physicalAddress?.full_address || ''
  );
  result = result.split('{{client_mailing_address}}').join(
    client.mailingAddress?.full_address || ''
  );
  result = result.split('{{client_income_source}}').join(
    (client.incomeSources?.[0]?.source || '') + ' ' + (client.incomeSources?.[0]?.amount || '')
  );
  result = result.split('{{client_immigration_status}}').join(
    client.immigrationDetails?.status || ''
  );
  result = result.split('{{client_immigration_date}}').join(
    client.immigrationDetails?.entry_date || ''
  );

  result = result.split('{{agent_name}}').join(agent.name || '');
  result = result.split('{{agent_npn}}').join(agent.npn || '');
  result = result.split('{{agent_phone}}').join(agent.phone || '');
  result = result.split('{{agent_email}}').join(agent.email || '');

  const today = new Date();
  result = result.split('{{current_year}}').join(today.getFullYear().toString());
  result = result.split('{{current_date}}').join(today.toLocaleDateString());

  return result;
}
