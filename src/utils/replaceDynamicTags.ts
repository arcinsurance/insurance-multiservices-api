// src/utils/replaceDynamicTags.ts

export function replaceDynamicTags(content: string, data: any): string {
  const { client, agent } = data;

  let result = content;

  // Dirección física
  result = result.replace('{{client_address1}}', client?.physicalAddress?.line1 || '');

  // Ocupación principal
  const occupation =
    client.incomeSources?.find((src: any) => !!src.positionOccupation)?.positionOccupation ||
    '';
  result = result.replace('{{client_occupation}}', occupation);

  // Fuente de ingreso principal
  const incomeSource =
    client.incomeSources?.find((src: any) => !!src.employerOrSelfEmployed)?.employerOrSelfEmployed ||
    '';
  result = result.replace('{{client_income_source}}', incomeSource);

  // Ingreso total estimado (usando annualIncome)
  const totalIncome = client.incomeSources?.reduce((acc: number, src: any) => {
    const val = parseFloat(src.annualIncome);
    return acc + (isNaN(val) ? 0 : val);
  }, 0) || 0;
  result = result.replace('{{client_income}}', `$${totalIncome.toLocaleString('en-US')}`);

  // Estatus migratorio
  result = result.replace('{{client_immigration_status}}', client.immigrationDetails?.status || '');

  // Fecha de entrada al país
  result = result.replace('{{client_immigration_date}}', client.immigrationDetails?.entry_date || '');

  // Datos del agente
  result = result.replace('{{agent_name}}', agent?.name || '');
  result = result.replace('{{agent_email}}', agent?.email || '');
  result = result.replace('{{agent_phone}}', agent?.phone || '');

  // Fecha y hora actual
  const now = new Date();
  result = result.replace('{{current_datetime}}', now.toLocaleString('es-US'));

  return result;
}
