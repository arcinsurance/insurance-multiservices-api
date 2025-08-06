// src/models/client.ts
import { db } from '../config/db';

// Trae todos los clientes ordenados por fecha de ingreso
export async function getClientsFromDB() {
  const [rows]: [any[], any] = await db.query('SELECT * FROM clients ORDER BY date_added DESC');
  return rows;
}

// Trae un cliente por su ID (con assigned_agent_id)
export async function getClientByIdFromDB(id: string) {
  const [rows]: [any[], any] = await db.query('SELECT * FROM clients WHERE id = ?', [id]);
  return rows[0] || null;
}

// Crea un nuevo cliente
export async function createClientInDB(clientData: any) {
  const [result]: [any, any] = await db.query(
    `INSERT INTO clients (name, email, phone, date_of_birth, date_added, assigned_agent_id) VALUES (?, ?, ?, ?, NOW(), ?)`,
    [
      clientData.name,
      clientData.email,
      clientData.phone,
      clientData.date_of_birth,
      clientData.assigned_agent_id || null
    ]
  );
  // ⚠️ Si usas AUTO_INCREMENT para id, asegúrate de que el frontend maneja ese valor
  return { ...clientData, id: (result as any).insertId, date_added: new Date() };
}

export default {
  getClientsFromDB,
  getClientByIdFromDB,
  createClientInDB,
  // ...otros métodos
};
