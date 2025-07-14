interface ClientData {
  name: string;
  email?: string;
  phone?: string;
  date_of_birth?: string;
  preferred_language?: string;
  physicalAddress?: {
    line1?: string;
    city?: string;
    state?: string;
    zip_code?: string;
  };
  assigned_agent_full_name?: string;
  agent_npn?: string;
}

export function replaceDynamicTags(template: string, client: ClientData): string {
  let result = template;

  // Utilidad de reemplazo segura
  const safeReplace = (str: string, search: string, replacement: string = '') =>
    str.split(search).join(replacement);

  // Datos del cliente
  result = safeReplace(result, '{{client_name}}', client.name);
  result = safeReplace(result, '{{client_email}}', client.email || '');
  result = safeReplace(result, '{{client_phone}}', client.phone || '');
  result = safeReplace(result, '{{client_dob}}', client.date_of_birth || '');
  result = safeReplace(result, '{{client_language}}', client.preferred_language || '');

  // Dirección física
  if (client.physicalAddress) {
    const { line1 = '', city = '', state = '', zip_code = '' } = client.physicalAddress;
    const address = [line1, city, state, zip_code].filter(Boolean).join(', ');
    result = safeReplace(result, '{{client_address1}}', address);
  } else {
    result = safeReplace(result, '{{client_address1}}', '');
  }

  // Datos del agente
  result = safeReplace(result, '{{agent_name}}', client.assigned_agent_full_name || '');
  result = safeReplace(result, '{{agent_npn}}', client.agent_npn || '');

  // Datos del sistema
  const today = new Date();
  const currentYear = today.getFullYear().toString();
  const currentDate = today.toISOString().split('T')[0];

  result = safeReplace(result, '{{current_year}}', currentYear);
  result = safeReplace(result, '{{current_date}}', currentDate);

  return result;
}
