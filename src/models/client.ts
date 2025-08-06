// src/models/client.ts
import { db } from '../config/db';
import { v4 as uuidv4 } from 'uuid';

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

// Crea un nuevo cliente (usa UUID para id)
export async function createClientInDB(clientData: any) {
  const newId = uuidv4();
  const [result]: [any, any] = await db.query(
    `INSERT INTO clients (id, name, email, phone, date_of_birth, assigned_agent_id, date_added) VALUES (?, ?, ?, ?, ?, ?, NOW())`,
    [
      newId,
      clientData.name,
      clientData.email,
      clientData.phone,
      clientData.date_of_birth,
      clientData.assigned_agent_id || null,
    ]
  );
  // Traer el cliente recién creado usando el id
  const [rows]: [any[], any] = await db.query('SELECT * FROM clients WHERE id = ?', [newId]);
  return rows[0] || { ...clientData, id: newId, date_added: new Date() };
}

// Actualiza datos de un cliente
export async function updateClientInDB(id: string, clientData: any) {
  await db.query(
    `UPDATE clients SET name=?, email=?, phone=?, date_of_birth=?, assigned_agent_id=? WHERE id=?`,
    [
      clientData.name,
      clientData.email,
      clientData.phone,
      clientData.date_of_birth,
      clientData.assigned_agent_id || null,
      id
    ]
  );
  // Retorna el cliente actualizado
  const [rows]: [any[], any] = await db.query('SELECT * FROM clients WHERE id = ?', [id]);
  return rows[0] || null;
}

// Borra un cliente
export async function deleteClientInDB(id: string) {
  const [result]: [any, any] = await db.query(`DELETE FROM clients WHERE id = ?`, [id]);
  return result;
}

// Export default para compatibilidad con imports modernos
export default {
  getClientsFromDB,
  getClientByIdFromDB,
  createClientInDB,
  updateClientInDB,
  deleteClientInDB
};
