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

// Crea un ingreso para un cliente
export async function createIncomeSourceForClient(clientId: string, income: any) {
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
  // Devuelve el ingreso recién creado
  const [rows]: [any[], any] = await db.query(
    `SELECT * FROM income_sources WHERE id = ?`, [result.insertId]
  );
  return rows[0];
}

// Actualiza ingresos de un cliente (NOTA: idealmente debería ser por ID, no solo por clientId)
export async function updateIncomeSourceForClient(clientId: string, income: any) {
  const data = normalizeIncome(income);

  // Si income tiene un ID, actualiza ese; si no, actualiza el primero que encuentre
  let updateResult;
  if (income.id) {
    [updateResult] = await db.query(
      `UPDATE income_sources SET employer=?, position=?, annual_income=? WHERE client_id=? AND id=?`,
      [
        data.employer,
        data.position,
        data.annual_income,
        clientId,
        income.id
      ]
    );
    // Devuelve el ingreso actualizado
    const [rows]: [any[], any] = await db.query(
      `SELECT * FROM income_sources WHERE id = ?`, [income.id]
    );
    return rows[0];
  } else {
    [updateResult] = await db.query(
      `UPDATE income_sources SET employer=?, position=?, annual_income=? WHERE client_id=? LIMIT 1`,
      [
        data.employer,
        data.position,
        data.annual_income,
        clientId
      ]
    );
    // Devuelve todos los ingresos del cliente para refrescar el frontend
    const [rows]: [any[], any] = await db.query(
      `SELECT * FROM income_sources WHERE client_id=?`, [clientId]
    );
    return rows;
  }
}

export default {
  getIncomeSourcesByClientId,
  createIncomeSourceForClient,
  updateIncomeSourceForClient
};
