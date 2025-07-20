export function replaceDynamicTags(template: string, data: any): string {
  let result = template;

  const client = data.client || {};
  const agent = data.agent || {};

  // CLIENTE
  result = result.split('{{client_name}}').join(`<p><strong>Nombre:</strong> ${client.name || ''}</p>`);
  result = result.split('{{client_dob}}').join(`<p><strong>Fecha de nacimiento:</strong> ${client.dob || ''}</p>`);
  result = result.split('{{client_phone}}').join(`<p><strong>Teléfono:</strong> ${client.phone || ''}</p>`);
  result = result.split('{{client_email}}').join(`<p><strong>Email:</strong> ${client.email || ''}</p>`);
  result = result.split('{{client_ssn}}').join(`<p><strong>SSN:</strong> ${client.ssn || ''}</p>`);
  result = result.split('{{client_physical_address}}').join(
    `<p><strong>Dirección física:</strong> ${client.physicalAddress?.full_address || ''}</p>`
  );
  result = result.split('{{client_mailing_address}}').join(
    `<p><strong>Dirección postal:</strong> ${client.mailingAddress?.full_address || ''}</p>`
  );
  result = result.split('{{client_income_source}}').join(
    `<p><strong>Fuente de ingreso:</strong> ${(client.incomeSources?.[0]?.source || '')} ${client.incomeSources?.[0]?.amount || ''}</p>`
  );
  result = result.split('{{client_immigration_status}}').join(
    `<p><strong>Estatus migratorio:</strong> ${client.immigrationDetails?.status || ''}</p>`
  );
  result = result.split('{{client_immigration_date}}').join(
    `<p><strong>Fecha de entrada:</strong> ${client.immigrationDetails?.entry_date || ''}</p>`
  );

  // AGENTE
  result = result.split('{{agent_name}}').join(`<p><strong>Agente asignado:</strong> ${agent.name || ''}</p>`);
  result = result.split('{{agent_npn}}').join(`<p><strong>NPN del agente:</strong> ${agent.npn || ''}</p>`);
  result = result.split('{{agent_phone}}').join(`<p><strong>Teléfono del agente:</strong> ${agent.phone || ''}</p>`);
  result = result.split('{{agent_email}}').join(`<p><strong>Email del agente:</strong> ${agent.email || ''}</p>`);

  // FECHA
  const today = new Date();
  const currentDate = today.toLocaleDateString('es-ES');
  const currentDateTime = today.toLocaleString('es-ES', {
    dateStyle: 'full',
    timeStyle: 'short',
    timeZone: 'America/New_York',
  });

  result = result.split('{{current_year}}').join(`<p><strong>Año actual:</strong> ${today.getFullYear().toString()}</p>`);
  result = result.split('{{current_date}}').join(`<p><strong>Fecha de generación:</strong> ${currentDate}</p>`);
  result = result.split('{{current_datetime}}').join(`<p><strong>Fecha y hora exacta:</strong> ${currentDateTime}</p>`);

  return result;
}
