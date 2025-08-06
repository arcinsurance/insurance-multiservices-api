// src/models/incomeSource.ts
import { db } from '../config/db';

export async function getIncomeSourcesByClientId(clientId: string) {
  const [rows]: [any[], any] = await db.query('SELECT * FROM client_employment WHERE client_id = ?', [clientId]);
  return rows;
}

export async function createIncomeSourceInDB(sourceData: any) {
  const [result]: any = await db.query(
    `INSERT INTO client_employment (client_id, employer, position, annual_income) VALUES (?, ?, ?, ?)`,
    [
      sourceData.clientId,
      sourceData.employer,
      sourceData.position,
      sourceData.annual_income
    ]
  );
  return { ...sourceData, id: result.insertId };
}

export async function updateIncomeSourceInDB(clientId: string, sourceData: any) {
  const [result]: any = await db.query(
    `UPDATE client_employment SET employer=?, position=?, annual_income=? WHERE client_id=?`,
    [
      sourceData.employer,
      sourceData.position,
      sourceData.annual_income,
      clientId
    ]
  );
  return result;
}
