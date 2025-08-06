// src/models/address.ts
import { db } from '../config/db';

// Trae direcciones de un cliente por su ID
export async function getAddressesByClientId(clientId: string) {
  const [rows]: [any[], any] = await db.query('SELECT * FROM addresses WHERE client_id = ?', [clientId]);
  return rows;
}

// Crea una dirección para un cliente
export async function createAddressForClient(clientId: string, address: any) {
  const [result]: [any, any] = await db.query(
    `INSERT INTO addresses (client_id, line1, line2, city, state, zip_code, type) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      clientId,
      address.line1,
      address.line2,
      address.city,
      address.state,
      address.zip_code,
      address.type || 'physical'
    ]
  );
  return result;
}

// Actualiza una dirección existente de un cliente
export async function updateAddressForClient(clientId: string, address: any) {
  const [result]: [any, any] = await db.query(
    `UPDATE addresses SET line1=?, line2=?, city=?, state=?, zip_code=? WHERE client_id=? AND type=?`,
    [
      address.line1,
      address.line2,
      address.city,
      address.state,
      address.zip_code,
      clientId,
      address.type || 'physical'
    ]
  );
  return result;
}

// ====> Export default para compatibilidad con imports modernos
export default {
  getAddressesByClientId,
  createAddressForClient,
  updateAddressForClient
};
