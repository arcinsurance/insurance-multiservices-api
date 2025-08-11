// src/models/agent.ts
import { db } from '../config/db';

export async function getAgentsFromDB() {
  const sql = `SELECT id, full_name, email, phone, role, is_active FROM agents`;
  const [rows]: [any[], any] = await db.query(sql);
  return rows;
}

export default {
  getAgentsFromDB,
};
