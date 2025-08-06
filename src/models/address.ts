// src/models/address.ts
import { db } from '../config/db';

export async function getAddressesByClientId(clientId: string) {
  const [rows]: [any[], any] = await db.query('SELECT * FROM client_addresses WHERE client_id = ?', [clientId]);
  return rows;
}

export async function createAddressInDB(addressData: any) {
  const [result]: any = await db.query(
    `INSERT INTO client_addresses (client_id, line1, line2, city, state, zip_code, type) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      addressData.clientId,
      addressData.line1,
      addressData.line2,
      addressData.city,
      addressData.state,
      addressData.zip_code,
      addressData.type // 'physical' o 'mailing'
    ]
  );
  return { ...addressData, id: result.insertId };
}

export async function updateAddressInDB(clientId: string, addressData: any, type: string) {
  const [result]: any = await db.query(
    `UPDATE client_addresses SET line1=?, line2=?, city=?, state=?, zip_code=? WHERE client_id=? AND type=?`,
    [
      addressData.line1,
      addressData.line2,
      addressData.city,
      addressData.state,
      addressData.zip_code,
      clientId,
      type
    ]
  );
  return result;
}
