// src/models/address.ts
import { db } from '../config/db';

// Normaliza el objeto address para aceptar tanto camelCase como snake_case
function normalizeAddress(address: any) {
  return {
    line1: address.line1 || address.line_1 || '',
    line2: address.line2 || address.line_2 || '',
    city: address.city || '',
    state: address.state || '',
    zip_code: address.zipCode || address.zip_code || '',
    type: address.type || 'physical',
  };
}

// Trae direcciones de un cliente por su ID
export async function getAddressesByClientId(clientId: string) {
  const [rows]: [any[], any] = await db.query(
    'SELECT * FROM addresses WHERE client_id = ?', [clientId]
  );
  return rows;
}

// Crea UNA dirección para un cliente
export async function createAddressForClient(clientId: string, address: any) {
  const addr = normalizeAddress(address);
  const [result]: [any, any] = await db.query(
    `INSERT INTO addresses (client_id, line1, line2, city, state, zip_code, type)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      clientId,
      addr.line1,
      addr.line2,
      addr.city,
      addr.state,
      addr.zip_code,
      addr.type
    ]
  );
  // Devuelve la dirección creada
  const [rows]: [any[], any] = await db.query(
    `SELECT * FROM addresses WHERE id = ?`, [result.insertId]
  );
  return rows[0];
}

// Crea MULTIPLES direcciones para un cliente (por ejemplo física y mailing en una sola llamada)
export async function createAddressesForClient(clientId: string, addresses: any[]) {
  if (!Array.isArray(addresses) || addresses.length === 0) return [];
  const results = [];
  for (const address of addresses) {
    const dir = await createAddressForClient(clientId, address);
    results.push(dir);
  }
  return results;
}

// Actualiza una dirección existente de un cliente (por tipo)
export async function updateAddressForClient(clientId: string, address: any) {
  const addr = normalizeAddress(address);
  const [result]: [any, any] = await db.query(
    `UPDATE addresses SET line1=?, line2=?, city=?, state=?, zip_code=?
     WHERE client_id=? AND type=?`,
    [
      addr.line1,
      addr.line2,
      addr.city,
      addr.state,
      addr.zip_code,
      clientId,
      addr.type
    ]
  );
  // Devuelve la dirección actualizada
  const [rows]: [any[], any] = await db.query(
    `SELECT * FROM addresses WHERE client_id=? AND type=?`,
    [clientId, addr.type]
  );
  return rows[0];
}

export default {
  getAddressesByClientId,
  createAddressForClient,
  createAddressesForClient, // <- NUEVO, para lote!
  updateAddressForClient
};
