// src/models/immigrationDetails.ts
import { db } from '../config/db';

// Trae detalles migratorios de un cliente por su ID
export async function getImmigrationDetailsByClientId(clientId: string) {
  const [rows]: [any[], any] = await db.query('SELECT * FROM immigration_details WHERE client_id = ?', [clientId]);
  return rows[0] || null;
}

// Crea detalles migratorios para un cliente
export async function createImmigrationDetailsForClient(clientId: string, immigration: any) {
  const [result]: [any, any] = await db.query(
    `INSERT INTO immigration_details (client_id, status, category, ssn, uscis_number) VALUES (?, ?, ?, ?, ?)`,
    [
      clientId,
      immigration.status,
      immigration.category,
      immigration.ssn,
      immigration.uscis_number
    ]
  );
  return result;
}

// Actualiza detalles migratorios de un cliente
export async function updateImmigrationDetailsForClient(clientId: string, immigration: any) {
  const [result]: [any, any] = await db.query(
    `UPDATE immigration_details SET status=?, category=?, ssn=?, uscis_number=? WHERE client_id=?`,
    [
      immigration.status,
      immigration.category,
      immigration.ssn,
      immigration.uscis_number,
      clientId
    ]
  );
  return result;
}

// ====> Export default para compatibilidad con imports modernos
export default {
  getImmigrationDetailsByClientId,
  createImmigrationDetailsForClient,
  updateImmigrationDetailsForClient
};
