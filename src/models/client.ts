// src/models/client.ts
import { db } from '../config/db';
import { v4 as uuidv4 } from 'uuid';

// Nombres de los campos que vamos a guardar (ajústalos si agregas/eliminas en la DB)
const CLIENT_FIELDS = [
  'id',
  'first_name',
  'middle_name',
  'last_name',
  'last_name_2',
  'name',
  'email',
  'phone',
  'date_of_birth',
  'gender',
  'preferred_language',
  'is_tobacco_user',
  'is_pregnant',
  'assigned_agent_id',
  'date_added'
];

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

  // Mapeo y limpieza de los campos
  const fields = [
    newId,
    clientData.first_name,
    clientData.middle_name || null,
    clientData.last_name,
    clientData.last_name_2 || null,
    clientData.name, // nombre completo, útil para búsquedas rápidas
    clientData.email,
    clientData.phone,
    clientData.date_of_birth,
    clientData.gender || null,
    clientData.preferred_language || null,
    clientData.is_tobacco_user ? 1 : 0,
    clientData.is_pregnant ? 1 : 0,
    clientData.assigned_agent_id || null
    // date_added es NOW() en SQL
  ];

  await db.query(
    `INSERT INTO clients 
      (id, first_name, middle_name, last_name, last_name_2, name, email, phone, date_of_birth, gender, preferred_language, is_tobacco_user, is_pregnant, assigned_agent_id, date_added)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
    fields
  );

  // Traer el cliente recién creado usando el id
  const [rows]: [any[], any] = await db.query('SELECT * FROM clients WHERE id = ?', [newId]);
  return rows[0] || { ...clientData, id: newId, date_added: new Date() };
}

// Actualiza datos de un cliente
export async function updateClientInDB(id: string, clientData: any) {
  // Armamos el SET de campos dinámicamente
  const setParts = [];
  const values = [];

  if ('first_name' in clientData) { setParts.push('first_name=?'); values.push(clientData.first_name); }
  if ('middle_name' in clientData) { setParts.push('middle_name=?'); values.push(clientData.middle_name); }
  if ('last_name' in clientData) { setParts.push('last_name=?'); values.push(clientData.last_name); }
  if ('last_name_2' in clientData) { setParts.push('last_name_2=?'); values.push(clientData.last_name_2); }
  if ('name' in clientData) { setParts.push('name=?'); values.push(clientData.name); }
  if ('email' in clientData) { setParts.push('email=?'); values.push(clientData.email); }
  if ('phone' in clientData) { setParts.push('phone=?'); values.push(clientData.phone); }
  if ('date_of_birth' in clientData) { setParts.push('date_of_birth=?'); values.push(clientData.date_of_birth); }
  if ('gender' in clientData) { setParts.push('gender=?'); values.push(clientData.gender); }
  if ('preferred_language' in clientData) { setParts.push('preferred_language=?'); values.push(clientData.preferred_language); }
  if ('is_tobacco_user' in clientData) { setParts.push('is_tobacco_user=?'); values.push(clientData.is_tobacco_user ? 1 : 0); }
  if ('is_pregnant' in clientData) { setParts.push('is_pregnant=?'); values.push(clientData.is_pregnant ? 1 : 0); }
  if ('assigned_agent_id' in clientData) { setParts.push('assigned_agent_id=?'); values.push(clientData.assigned_agent_id); }
  // ¡Agrega aquí más campos si agregas en la DB!

  if (setParts.length === 0) {
    throw new Error('No update fields provided');
  }

  values.push(id); // para el WHERE

  await db.query(
    `UPDATE clients SET ${setParts.join(', ')} WHERE id=?`,
    values
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
