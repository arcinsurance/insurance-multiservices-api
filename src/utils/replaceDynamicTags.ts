// src/utils/replaceDynamicTags.ts

export function replaceDynamicTags(content: string, data: any): string {
  const { client, agent, policy } = data;

  let result = content;

  // -------- DATOS DEL CLIENTE --------
  result = result.replace(/{{client_name}}/g, client?.name || '');
  result = result.replace(/{{client_dob}}/g, client?.dob || '');
  result = result.replace(/{{client_address1}}/g, client?.physicalAddress?.line1 || '');

  // -------- DATOS DE POLÍTICA --------
  result = result.replace(/{{policy_market_id}}/g, policy?.market_id || '');

  // -------- OCUPACIÓN E INGRESOS --------
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

  // -------- ESTATUS MIGRATORIO --------
  result = result.replace(/{{client_immigration_status}}/g, client?.immigrationDetails?.status || '');
  result = result.replace(/{{client_immigration_date}}/g, client?.immigrationDetails?.entry_date || '');

  // -------- DATOS DEL AGENTE --------
  result = result.replace(/{{agent_name}}/g, agent?.full_name || agent?.name || '');
  result = result.replace(/{{agent_email}}/g, agent?.email || '');
  result = result.replace(/{{agent_phone}}/g, agent?.phone || '');

  // -------- FECHAS --------
  const now = new Date();
  result = result.replace(/{{current_datetime}}/g, now.toLocaleString('es-US'));
  result = result.replace(/{{current_date}}/g, now.toLocaleDateString('es-US'));
  result = result.replace(/{{current_year}}/g, now.getFullYear().toString());

  return result;
}
