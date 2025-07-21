// src/utils/replaceDynamicTags.ts

export function replaceDynamicTags(content: string, data: any): string {
  const { client, agent } = data;

  let result = content;

  // Dirección física
  result = result.replace(/{{\s*client_address1\s*}}/g, client?.physicalAddress?.line1 || '');

  // Ocupación principal
  const occupation =
    client?.incomeSources?.find((src: any) => !!src.positionOccupation)?.positionOccupation || '';
  result = result.replace(/{{\s*client_occupation\s*}}/g, occupation);

  // Fuente de ingreso principal
  const incomeSource =
    client?.incomeSources?.find((src: any) => !!src.employerOrSelfEmployed)?.employerOrSelfEmployed || '';
  result = result.replace(/{{\s*client_income_source\s*}}/g, incomeSource);

  // Ingreso total estimado (usando annualIncome)
  const totalIncome = client?.incomeSources?.reduce((acc: number, src: any) => {
    const val = parseFloat(src.annualIncome || '0');
    return acc + (isNaN(val) ? 0 : val);
  }, 0) || 0;
  result = result.replace(/{{\s*client_income\s*}}/g, `$${totalIncome.toLocaleString('en-US')}`);

  // Estatus migratorio
  result = result.replace(/{{\s*client_immigration_status\s*}}/g, client?.immigrationDetails?.status || '');

  // Fecha de entrada al país
  result = result.replace(/{{\s*client_immigration_date\s*}}/g, client?.immigrationDetails?.entry_date || '');

  // Datos del agente
  result = result.replace(/{{\s*agent_name\s*}}/g, agent?.name || '');
  result = result.replace(/{{\s*agent_email\s*}}/g, agent?.email || '');
  result = result.replace(/{{\s*agent_phone\s*}}/g, agent?.phone || '');

  // Fecha y hora actual
  const now = new Date();
  result = result.replace(/{{\s*current_datetime\s*}}/g, now.toLocaleString('es-US'));

  return result;
}
