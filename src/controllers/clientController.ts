import { Request, Response } from 'express';
import { db } from '../config/db';

/* ---------------------------- GET ALL ---------------------------- */
export async function getClients(_req: Request, res: Response) {
  const [rows] = await db.query('SELECT * FROM clients');
  res.json(rows);
}

/* ---------------------------- CREATE ----------------------------- */
export async function createClient(req: Request, res: Response) {
  try {
    const {
      assignedAgentId,
      firstName,
      middleName,
      lastName,
      lastName2,
      email,
      phone,
      dateOfBirth,
      gender,
      preferredLanguage,
      isTobaccoUser = false,
      isPregnant   = false,
      isLead       = false,
    } = req.body;

    /*  ⚠️  Validaciones mínimas  */
    if (!firstName || !lastName) {
      return res.status(400).json({ message: 'firstName and lastName are required.' });
    }

    /*  Reemplazar undefined → null  */
    const params = [
      assignedAgentId || null,
      firstName,
      middleName       ?? null,
      lastName,
      lastName2        ?? null,
      email            ?? null,
      phone            ?? null,
      dateOfBirth      ?? null,
      gender           ?? null,
      preferredLanguage?? null,
      isTobaccoUser,
      isPregnant,
      isLead,
    ];

    const [result] = await db.execute(
      `INSERT INTO clients (
        agent_id, first_name, middle_name, last_name, last_name_2,
        email, phone, date_of_birth, gender, preferred_language,
        is_tobacco_user, is_pregnant, is_lead
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      params
    );

    res.status(201).json({ id: (result as any).insertId });
  } catch (err) {
    console.error('Error creating client:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
}

/* ---------------------------- UPDATE ----------------------------- */
export async function updateClient(req: Request, res: Response) {
  const { id } = req.params;
  const {
    firstName,
    middleName,
    lastName,
    lastName2,
    email,
    phone,
    dateOfBirth,
    gender,
    preferredLanguage,
    isTobaccoUser,
    isPregnant,
    isLead,
  } = req.body;

  await db.execute(
    `UPDATE clients SET
      first_name = ?,  middle_name = ?, last_name = ?, last_name_2 = ?,
      email = ?, phone = ?, date_of_birth = ?, gender = ?, preferred_language = ?,
      is_tobacco_user = ?, is_pregnant = ?, is_lead = ?
     WHERE id = ?`,
    [
      firstName, middleName ?? null, lastName, lastName2 ?? null,
      email ?? null, phone ?? null, dateOfBirth ?? null, gender ?? null, preferredLanguage ?? null,
      isTobaccoUser ?? false, isPregnant ?? false, isLead ?? false,
      id,
    ]
  );
  res.sendStatus(204);
}

/* ---------------------------- DELETE ----------------------------- */
export async function deleteClient(req: Request, res: Response) {
  const { id } = req.params;
  await db.execute('DELETE FROM clients WHERE id = ?', [id]);
  res.sendStatus(204);
}
