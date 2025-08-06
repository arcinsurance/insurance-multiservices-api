// src/models/incomeSource.ts
import { db } from '../config/db';

// Normaliza el objeto de ingreso para aceptar ambos estilos
function normalizeIncome(income: any) {
  return {
    employer: income.employer || income.employerOrSelfEmployed || '',
    position: income.position || income.positionOccupation || '',
    annual_income: income.annual_income !== undefined ? income.annual_income : income.annualIncome || 0,
    // Puedes agregar más campos aquí si tu tabla tiene más columnas
  };
}

// Trae ingresos de un cliente por su ID
export async function getIncomeSourcesByClientId(clientId: string) {
  const [rows]: [any[], any] = await db.query(
    'SELECT * FROM income_sources WHERE client_id = ?', [clientId]
  );
  return rows;
}

// Crea **MÚLTIPLES** ingresos para un cliente (array de ingresos)
export async function createIncomeSourcesForClient(clientId: string, incomes: any[]) {
  if (!Array.isArray(incomes) || incomes.length === 0) return [];
  const results = [];
  for (const income of incomes) {
    const data = normalizeIncome(income);
    const [result]: [any, any] = await db.query(
      `INSERT INTO income_sources (client_id, employer, position, annual_income)
       VALUES (?, ?, ?, ?)`,
      [
        clientId,
        data.employer,
        data.position,
        data.annual_income
      ]
    );
    // Trae el ingreso recién creado y lo agrega al array
    const [rows]: [any[], any] = await db.query(
      `SELECT * FROM income_sources WHERE id = ?`, [result.insertId]
    );
    if (rows.length > 0) results.push(rows[0]);
  }
  return results;
}

// Actualiza TODOS los ingresos de un cliente: borra los existentes y agrega los nuevos
export async function updateIncomeSourceForClient(clientId: string, incomes: any[]) {
  if (!Array.isArray(incomes)) {
    throw new Error('Expected income array');
  }
  // Borra todas las fuentes anteriores
  await db.query('DELETE FROM income_sources WHERE client_id = ?', [clientId]);
  // Inserta las nuevas
  return await createIncomeSourcesForClient(clientId, incomes);
}

export default {
  getIncomeSourcesByClientId,
  createIncomeSourcesForClient,
  updateIncomeSourceForClient,
};
