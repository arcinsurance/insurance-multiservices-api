// src/models/incomeSource.ts
import { db } from '../config/db';

// Trae ingresos de un cliente por su ID
export async function getIncomeSourcesByClientId(clientId: string) {
  const [rows]: [any[], any] = await db.query('SELECT * FROM client_employment WHERE client_id = ?', [clientId]);
  return rows;
}

// Crea un ingreso para un cliente
export async function createIncomeSourceForClient(clientId: string, income: any) {
  const [result]: [any, any] = await db.query(
    `INSERT INTO client_employment (client_id, employer, position, annual_income) VALUES (?, ?, ?, ?)`,
    [
      clientId,
      income.employer,
      income.position,
      income.annual_income
    ]
  );
  return result;
}

// Actualiza ingresos de un cliente
export async function updateIncomeSourceForClient(clientId: string, income: any) {
  const [result]: [any, any] = await db.query(
    `UPDATE client_employment SET employer=?, position=?, annual_income=? WHERE client_id=?`,
    [
      income.employer,
      income.position,
      income.annual_income,
      clientId
    ]
  );
  return result;
}

// ====> Export default para compatibilidad con imports modernos
export default {
  getIncomeSourcesByClientId,
  createIncomeSourceForClient,
  updateIncomeSourceForClient
};
