// src/utils/replaceDynamicTags.ts

export function replaceDynamicTags(content: string, data: any): string {
  const { client, agent, policy } = data;

  let result = content;

  // Dirección física
  result = result.replace(/{{client_address1}}/g, client?.physicalAddress?.line1 || '');

  // Ocupación principal
  const occupation = client?.incomeSources?.[0]?.positionOccupation || '';
  result = result.replace(/{{client_occupation}}/g, occupation);

  // Fuente de ingreso principal
  const incomeSource = client?.incomeSources?.[0]?.employerOrSelfEmployed || '';
  result = result.replace(/{{client_income_source}}/g, incomeSource);

  // Ingreso total estimado
  const totalIncome = client?.incomeSources?.reduce((acc: number, src: any) => {
    const val = parseFloat(src.annualIncome || 0);
    return acc + (isNaN(val) ? 0 : val);
  }, 0) || 0;
  result = result.replace(/{{client_income}}/g, `$${totalIncome.toLocaleString('en-US')}`);

  // Estatus migratorio
  result = result.replace(/{{client_immigration_status}}/g, client?.immigrationDetails?.status || '');

  // Fecha de entrada al país
  result = result.replace(/{{client_immigration_date}}/g, client?.immigrationDetails?.entry_date || '');

  // Datos del agente
  result = result.replace(/{{agent_name}}/g, agent?.full_name || '');
  result = result.replace(/{{agent_email}}/g, agent?.email || '');
  result = result.replace(/{{agent_phone}}/g, agent?.phone || '');

  // Marketplace policy id
  result = result.replace(/{{policy_market_id}}/g, policy?.market_id || '');

  // Fecha de nacimiento cliente
  result = result.replace(/{{client_dob}}/g, client?.dateOfBirth || '');

  // Nombre completo cliente
  result = result.replace(/{{client_name}}/g, client?.name || '');

  // Fecha y hora actual
  const now = new Date();
  result = result.replace(/{{current_datetime}}/g, now.toLocaleString('es-US'));
  result = result.replace(/{{current_date}}/g, now.toLocaleDateString('es-US'));
  result = result.replace(/{{current_year}}/g, `${now.getFullYear()}`);

  return result;
}
