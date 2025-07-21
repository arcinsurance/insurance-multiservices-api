// src/utils/replaceDynamicTags.ts
export function replaceDynamicTags(template: string, data: any): string {
  let result = template;

  const client = data.client || {};
  const agent = data.agent || {};

  // Calcular ingreso total
  const totalIncome = client.incomeSources?.reduce((acc: number, src: any) => {
    const val = parseFloat(src.amount);
    return acc + (isNaN(val) ? 0 : val);
  }, 0) || 0;

  const formattedIncome = totalIncome.toLocaleString('es-ES', {
    style: 'currency',
    currency: 'USD',
  });

  // Obtener ocupación (primer cargo encontrado)
  const occupation =
    client.incomeSources?.find((src: any) => !!src.position)?.position ||
    client.incomeSources?.find((src: any) => !!src.source)?.source ||
    '';

  // CLIENTE
  result = result.split('{{client_name}}').join(`<strong>${client.name || ''}</strong>`);
  result = result.split('{{client_dob}}').join(`<strong>${client.dob || ''}</strong>`);
  result = result.split('{{client_phone}}').join(`<strong>${client.phone || ''}</strong>`);
  result = result.split('{{client_email}}').join(`<strong>${client.email || ''}</strong>`);
  result = result.split('{{client_ssn}}').join(`<strong>${client.ssn || ''}</strong>`);
  result = result.split('{{client_physical_address}}').join(
    `<strong>${client.physicalAddress?.full_address || ''}</strong>`
  );
  result = result.split('{{client_mailing_address}}').join(
    `<strong>${client.mailingAddress?.full_address || ''}</strong>`
  );
  result = result.split('{{client_address1}}').join(
    `<strong>${client.physicalAddress?.line1 || ''}</strong>`
  );
  result = result.split('{{client_income}}').join(`<strong>${formattedIncome}</strong>`);
  result = result.split('{{client_occupation}}').join(`<strong>${occupation}</strong>`);
  result = result.split('{{client_income_source}}').join(
    `<strong>${client.incomeSources?.[0]?.source || ''} ${client.incomeSources?.[0]?.amount || ''}</strong>`
  );
  result = result.split('{{client_immigration_status}}').join(
    `<strong>${client.immigrationDetails?.status || ''}</strong>`
  );
  result = result.split('{{client_immigration_date}}').join(
    `<strong>${client.immigrationDetails?.entry_date || ''}</strong>`
  );

  // AGENTE
  result = result.split('{{agent_name}}').join(`<strong>${agent.name || ''}</strong>`);
  result = result.split('{{agent_npn}}').join(`<strong>${agent.npn || ''}</strong>`);
  result = result.split('{{agent_phone}}').join(`<strong>${agent.phone || ''}</strong>`);
  result = result.split('{{agent_email}}').join(`<strong>${agent.email || ''}</strong>`);

  // FECHA
  const today = new Date();
  const currentDate = today.toLocaleDateString('es-ES');
  const currentDateTime = today.toLocaleString('es-ES', {
    dateStyle: 'full',
    timeStyle: 'short',
    timeZone: 'America/New_York',
  });

  result = result.split('{{current_year}}').join(`<strong>${today.getFullYear().toString()}</strong>`);
  result = result.split('{{current_date}}').join(`<strong>${currentDate}</strong>`);
  result = result.split('{{current_datetime}}').join(`<strong>${currentDateTime}</strong>`);

  return result;
}
