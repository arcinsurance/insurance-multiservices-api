import { Request, Response } from 'express';
import { db } from '../config/db';

/* ------------------------------------------------------------------ */
/* GET all clients                                                    */
/* ------------------------------------------------------------------ */
export async function getClients(_req: Request, res: Response) {
  const [rows] = await db.query('SELECT * FROM clients');
  res.json(rows);
}

/* ------------------------------------------------------------------ */
/* CREATE new client (contact)                                         */
/* ------------------------------------------------------------------ */
export async function createClient(req: Request, res: Response) {
  const {
    agent_id,
    first_name,
    middle_name = null,
    last_name,
    last_name_2 = null,
    email,
    phone,
    date_of_birth = null,
    gender = null,
    preferred_language = null,
    is_tobacco_user = false,
    is_pregnant = false,
    is_lead = false,
  } = req.body;

  const [result] = await db.execute(
    `INSERT INTO clients (
        agent_id, first_name, middle_name, last_name, last_name_2,
        email, phone, date_of_birth, gender, preferred_language,
        is_tobacco_user, is_pregnant, is_lead
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      agent_id,
      first_name,
      middle_name,
      last_name,
      last_name_2,
      email,
      phone,
      date_of_birth,
      gender,
      preferred_language,
      is_tobacco_user,
      is_pregnant,
      is_lead,
    ],
  );

  res.status(201).json({ id: (result as any).insertId });
}

/* ------------------------------------------------------------------ */
/* UPDATE client                                                      */
/* ------------------------------------------------------------------ */
export async function updateClient(req: Request, res: Response) {
  const { id } = req.params;
  const {
    first_name,
    middle_name = null,
    last_name,
    last_name_2 = null,
    email,
    phone,
    date_of_birth = null,
    gender = null,
    preferred_language = null,
    is_tobacco_user = false,
    is_pregnant = false,
    is_lead = false,
  } = req.body;

  await db.execute(
    `UPDATE clients SET
        first_name = ?,
        middle_name = ?,
        last_name = ?,
        last_name_2 = ?,
        email = ?,
        phone = ?,
        date_of_birth = ?,
        gender = ?,
        preferred_language = ?,
        is_tobacco_user = ?,
        is_pregnant = ?,
        is_lead = ?
      WHERE id = ?`,
    [
      first_name,
      middle_name,
      last_name,
      last_name_2,
      email,
      phone,
      date_of_birth,
      gender,
      preferred_language,
      is_tobacco_user,
      is_pregnant,
      is_lead,
      id,
    ],
  );

  res.sendStatus(204);
}

/* ------------------------------------------------------------------ */
/* DELETE client                                                      */
/* ------------------------------------------------------------------ */
export async function deleteClient(req: Request, res: Response) {
  const { id } = req.params;
  await db.execute('DELETE FROM clients WHERE id = ?', [id]);
  res.sendStatus(204);
}
