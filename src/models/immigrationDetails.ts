// src/models/immigrationDetails.ts
import { db } from '../config/db';

// Normaliza el objeto de inmigración para aceptar camelCase y snake_case
function normalizeImmigration(immigration: any) {
  return {
    status: immigration.status || '',
    category: immigration.category || '',
    ssn: immigration.ssn || '',
    uscis_number: immigration.uscis_number || immigration.uscisNumber || ''
  };
}

// Trae detalles migratorios de un cliente por su ID
export async function getImmigrationDetailsByClientId(clientId: string) {
  const [rows]: [any[], any] = await db.query(
    'SELECT * FROM immigration_details WHERE client_id = ?', [clientId]
  );
  return rows[0] || null;
}

// Crea detalles migratorios para un cliente
export async function createImmigrationDetailsForClient(clientId: string, immigration: any) {
  if (!immigration || typeof immigration !== 'object') {
    throw new Error('Invalid immigration details');
  }
  const data = normalizeImmigration(immigration);
  const [result]: [any, any] = await db.query(
    `INSERT INTO immigration_details (client_id, status, category, ssn, uscis_number)
     VALUES (?, ?, ?, ?, ?)`,
    [
      clientId,
      data.status,
      data.category,
      data.ssn,
      data.uscis_number
    ]
  );
  // Devuelve el registro recién creado
  const [rows]: [any[], any] = await db.query(
    'SELECT * FROM immigration_details WHERE client_id = ?', [clientId]
  );
  return rows[0] || null;
}

// Actualiza detalles migratorios de un cliente
export async function updateImmigrationDetailsForClient(clientId: string, immigration: any) {
  if (!immigration || typeof immigration !== 'object') {
    throw new Error('Invalid immigration details');
  }
  const data = normalizeImmigration(immigration);
  const [result]: [any, any] = await db.query(
    `UPDATE immigration_details SET status=?, category=?, ssn=?, uscis_number=? WHERE client_id=?`,
    [
      data.status,
      data.category,
      data.ssn,
      data.uscis_number,
      clientId
    ]
  );
  // Devuelve el registro actualizado
  const [rows]: [any[], any] = await db.query(
    'SELECT * FROM immigration_details WHERE client_id = ?', [clientId]
  );
  return rows[0] || null;
}

// Export default para compatibilidad con imports modernos
export default {
  getImmigrationDetailsByClientId,
  createImmigrationDetailsForClient,
  updateImmigrationDetailsForClient
};
