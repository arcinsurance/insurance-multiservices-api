// src/models/client.ts
import { db } from '../config/db';

// Trae todos los clientes ordenados por fecha de ingreso
export async function getClientsFromDB() {
  const [rows]: [any[], any] = await db.query('SELECT * FROM clients ORDER BY date_added DESC');
  return rows;
}

// Trae un cliente por su ID
export async function getClientByIdFromDB(id: string) {
  const [rows]: [any[], any] = await db.query('SELECT * FROM clients WHERE id = ?', [id]);
  return rows[0] || null;
}

// Crea un nuevo cliente
export async function createClientInDB(clientData: any) {
  const [result]: [any, any] = await db.query(
    `INSERT INTO clients (name, email, phone, date_of_birth, date_added) VALUES (?, ?, ?, ?, NOW())`,
    [
      clientData.name,
      clientData.email,
      clientData.phone,
      clientData.date_of_birth,
    ]
  );
  return { ...clientData, id: (result as any).insertId, date_added: new Date() };
}

// Actualiza datos de un cliente
export async function updateClientInDB(id: string, clientData: any) {
  const [result]: [any, any] = await db.query(
    `UPDATE clients SET name=?, email=?, phone=?, date_of_birth=? WHERE id=?`,
    [
      clientData.name,
      clientData.email,
      clientData.phone,
      clientData.date_of_birth,
      id
    ]
  );
  return result;
}

// Borra un cliente
export async function deleteClientInDB(id: string) {
  const [result]: [any, any] = await db.query(`DELETE FROM clients WHERE id = ?`, [id]);
  return result;
}

// Actualiza empleo del cliente
export async function updateClientEmploymentInDB(id: string, employmentData: any) {
  const [result]: [any, any] = await db.query(
    `UPDATE client_employment SET employer=?, position=?, annual_income=? WHERE client_id=?`,
    [
      employmentData.employer,
      employmentData.position,
      employmentData.annual_income,
      id
    ]
  );
  return result;
}

// Actualiza inmigración del cliente
export async function updateClientImmigrationInDB(id: string, immigrationData: any) {
  const [result]: [any, any] = await db.query(
    `UPDATE client_immigration SET status=?, category=?, ssn=?, uscis_number=? WHERE client_id=?`,
    [
      immigrationData.status,
      immigrationData.category,
      immigrationData.ssn,
      immigrationData.uscis_number,
      id
    ]
  );
  return result;
}

// Actualiza direcciones del cliente
export async function updateClientAddressesInDB(id: string, addressData: any) {
  const [result]: [any, any] = await db.query(
    `UPDATE client_addresses SET line1=?, line2=?, city=?, state=?, zip_code=? WHERE client_id=?`,
    [
      addressData.line1,
      addressData.line2,
      addressData.city,
      addressData.state,
      addressData.zip_code,
      id
    ]
  );
  return result;
}

// ====> Export default para compatibilidad con imports modernos
export default {
  getClientsFromDB,
  getClientByIdFromDB,
  createClientInDB,
  updateClientInDB,
  deleteClientInDB,
  updateClientEmploymentInDB,
  updateClientImmigrationInDB,
  updateClientAddressesInDB
};
