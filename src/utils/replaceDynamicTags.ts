// src/utils/replaceDynamicTags.ts

export function replaceDynamicTags(content: string, data: any): string {
  const { client, agent, policy } = data;

  let result = content;

  // ==== Datos básicos del cliente ====
  const clientName = client?.name || [
    client?.firstName,
    client?.middleName,
    client?.last_name,
    client?.last_name2,
  ]
    .filter(Boolean)
    .join(' ')
    .trim();

  result = result.replace(/{{client_name}}/g, clientName || '');

  const dob =
    client?.dob ||
    client?.dateOfBirth ||
    client?.date_of_birth ||
    '';
  result = result.replace(/{{client_dob}}/g, dob ? new Date(dob).toLocaleDateString('es-US') : '');

  result = result.replace(/{{client_address1}}/g, client?.physicalAddress?.line1 || '');
  result = result.replace(/{{client_address2}}/g, client?.physicalAddress?.line2 || '');
  result = result.replace(/{{client_city}}/g, client?.physicalAddress?.city || '');
  result = result.replace(/{{client_state}}/g, client?.physicalAddress?.state || '');
  result = result.replace(/{{client_zip}}/g, client?.physicalAddress?.zipCode || '');

  // ==== Ocupación e ingresos ====
  const occupation =
    client?.incomeSources?.find((src: any) => src.positionOccupation)?.positionOccupation || '';
  result = result.replace(/{{client_occupation}}/g, occupation);

  const incomeSource =
    client?.incomeSources?.find((src: any) => src.employerOrSelfEmployed)?.employerOrSelfEmployed || '';
  result = result.replace(/{{client_income_source}}/g, incomeSource);

  const totalIncome =
    client?.incomeSources?.reduce((acc: number, src: any) => {
      const val = parseFloat(src.annualIncome);
      return acc + (isNaN(val) ? 0 : val);
    }, 0) || 0;
  result = result.replace(/{{client_income}}/g, `$${totalIncome.toLocaleString('en-US')}`);

  // ==== Migración ====
  result = result.replace(/{{client_immigration_status}}/g, client?.immigrationDetails?.status || '');
  result = result.replace(/{{client_immigration_date}}/g, client?.immigrationDetails?.entry_date || '');

  // ==== Datos del agente ====
  result = result.replace(/{{agent_name}}/g, agent?.full_name || agent?.name || '');
  result = result.replace(/{{agent_email}}/g, agent?.email || '');
  result = result.replace(/{{agent_phone}}/g, agent?.phone || '');

  // ==== Póliza ====
  result = result.replace(/{{policy_market_id}}/g, policy?.market_id || '');

  // ==== Fecha y año actual ====
  const now = new Date();
  result = result.replace(/{{current_datetime}}/g, now.toLocaleString('es-US'));
  result = result.replace(/{{current_date}}/g, now.toLocaleDateString('es-US'));
  result = result.replace(/{{current_year}}/g, `${now.getFullYear()}`);

  return result;
}
