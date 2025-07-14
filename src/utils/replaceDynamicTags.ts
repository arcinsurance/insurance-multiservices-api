type ReplacementData = {
  client?: any;
  agent?: any;
  policy?: any;
};

export function replaceDynamicTags(template: string, data: ReplacementData): string {
  if (!template) return '';

  const tagMap: { [key: string]: string } = {
    '{{client_name}}': data.client?.name ?? '',
    '{{client_address1}}': `${data.client?.physicalAddress?.line1 ?? ''} ${data.client?.physicalAddress?.line2 ?? ''} ${data.client?.physicalAddress?.city ?? ''} ${data.client?.physicalAddress?.state ?? ''} ${data.client?.physicalAddress?.zipCode ?? ''}`,
    '{{client_dob}}': data.client?.date_of_birth ?? '',
    '{{client_phone}}': data.client?.phone ?? '',
    '{{client_email}}': data.client?.email ?? '',
    '{{client_gender}}': data.client?.gender ?? '',
    '{{client_language}}': data.client?.preferred_language ?? '',
    '{{client_ssn}}': data.client?.immigrationDetails?.ssn ?? '',
    '{{client_uscis}}': data.client?.immigrationDetails?.uscis_number ?? '',
    '{{client_employer}}': data.client?.incomeSources?.[0]?.employerOrSelfEmployed ?? '',

    '{{agent_name}}': data.agent?.full_name ?? '',
    '{{agent_npn}}': data.agent?.npn ?? '',

    '{{policy_market_id}}': data.policy?.market_id ?? '',

    '{{current_date}}': new Date().toLocaleDateString(),
    '{{current_year}}': new Date().getFullYear().toString(),
  };

  return Object.entries(tagMap).reduce((result, [tag, value]) => {
    return result.replaceAll(tag, value);
  }, template);
}
