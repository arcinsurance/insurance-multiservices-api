// src/utils/replaceDynamicTags.ts
export function replaceDynamicTags(content: string, data: any): string {
  const { client, agent } = data;
  let result = content;

  // --- Reemplazo dinámico de cualquier tag tipo {{client.xxx}} ---
  result = result.replace(/\{\{client\.([a-zA-Z0-9_]+)\}\}/g, (_, key) => {
    return client && client[key] !== undefined ? client[key] : '';
  });

  // --- Reemplazo dinámico de cualquier tag tipo {{agent.xxx}} ---
  result = result.replace(/\{\{agent\.([a-zA-Z0-9_]+)\}\}/g, (_, key) => {
    return agent && agent[key] !== undefined ? agent[key] : '';
  });

  // --- Tags especiales predefinidos ---
  // Dirección física (compatibilidad con tu formato anterior)
  result = result.replace('{{client_address1}}', client?.physicalAddress?.line1 || '');

  // Ocupación principal
  const occupation =
    client?.incomeSources?.find((src: any) => src.positionOccupation)?.positionOccupation || '';
  result = result.replace('{{client_occupation}}', occupation);

  // Fuente de ingreso principal
  const incomeSource =
    client?.incomeSources?.find((src: any) => src.employerOrSelfEmployed)?.employerOrSelfEmployed || '';
  result = result.replace('{{client_income_source}}', incomeSource);

  // Ingreso total estimado
  const totalIncome = client?.incomeSources?.reduce((acc: number, src: any) => {
    const val = parseFloat(src.annualIncome);
    return acc + (isNaN(val) ? 0 : val);
  }, 0) || 0;
  result = result.replace('{{client_income}}', `$${totalIncome.toLocaleString('en-US')}`);

  // Estatus migratorio y fecha
  result = result.replace('{{client_immigration_status}}', client?.immigrationDetails?.status || '');
  result = result.replace('{{client_immigration_date}}', client?.immigrationDetails?.entry_date || '');

  // Tags del agente (compatibilidad con formato anterior)
  result = result.replace('{{agent_name}}', agent?.full_name || '');
  result = result.replace('{{agent_email}}', agent?.email || '');
  result = result.replace('{{agent_phone}}', agent?.phone || '');

  // Fecha y hora actual
  const now = new Date();
  result = result.replace('{{current_datetime}}', now.toLocaleString('es-US'));

  return result;
}
