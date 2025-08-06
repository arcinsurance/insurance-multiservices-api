// src/models/immigrationDetails.ts
import { db } from '../config/db';

export async function getImmigrationDetailsByClientId(clientId: string) {
  const [rows]: [any[], any] = await db.query('SELECT * FROM client_immigration WHERE client_id = ?', [clientId]);
  return rows[0] || null;
}

export async function createImmigrationDetailsInDB(detailsData: any) {
  const [result]: any = await db.query(
    `INSERT INTO client_immigration (client_id, status, category, ssn, uscis_number) VALUES (?, ?, ?, ?, ?)`,
    [
      detailsData.clientId,
      detailsData.status,
      detailsData.category,
      detailsData.ssn,
      detailsData.uscis_number
    ]
  );
  return { ...detailsData, id: result.insertId };
}

export async function updateImmigrationDetailsInDB(clientId: string, detailsData: any) {
  const [result]: any = await db.query(
    `UPDATE client_immigration SET status=?, category=?, ssn=?, uscis_number=? WHERE client_id=?`,
    [
      detailsData.status,
      detailsData.category,
      detailsData.ssn,
      detailsData.uscis_number,
      clientId
    ]
  );
  return result;
}
