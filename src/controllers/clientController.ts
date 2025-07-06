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
    const data = req.body;

    // Validación mínima
    if (!data.firstName || !data.lastName) {
      return res.status(400).json({ message: 'firstName and lastName are required.' });
    }

    // Reemplazar undefined por null
    const sanitizedData = {
      assignedAgentId: data.assignedAgentId ?? null,
      firstName: data.firstName,
      middleName: data.middleName ?? null,
      lastName: data.lastName,
      lastName2: data.lastName2 ?? null,
      email: data.email ?? null,
      phone: data.phone ?? null,
      dateOfBirth: data.dateOfBirth ?? null,
      gender: data.gender ?? null,
      preferredLanguage: data.preferredLanguage ?? null,
      is_tobacco_user: data.isTobaccoUser ?? false,
      is_pregnant: data.isPregnant ?? false,
      is_lead: data.isLead ?? false,
    };

    const [result] = await db.execute(
      `INSERT INTO clients (
        assignedAgentId, firstName, middleName, lastName, lastName2,
        email, phone, dateOfBirth, gender, preferredLanguage,
        is_tobacco_user, is_pregnant, is_lead
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        sanitizedData.assignedAgentId,
        sanitizedData.firstName,
        sanitizedData.middleName,
        sanitizedData.lastName,
        sanitizedData.lastName2,
        sanitizedData.email,
        sanitizedData.phone,
        sanitizedData.dateOfBirth,
        sanitizedData.gender,
        sanitizedData.preferredLanguage,
        sanitizedData.is_tobacco_user,
        sanitizedData.is_pregnant,
        sanitizedData.is_lead,
      ]
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
      firstName = ?,  middleName = ?, lastName = ?, lastName2 = ?,
      email = ?, phone = ?, dateOfBirth = ?, gender = ?, preferredLanguage = ?,
      is_tobacco_user = ?, is_pregnant = ?, is_lead = ?
     WHERE id = ?`,
    [
      firstName,
      middleName ?? null,
      lastName,
      lastName2 ?? null,
      email ?? null,
      phone ?? null,
      dateOfBirth ?? null,
      gender ?? null,
      preferredLanguage ?? null,
      isTobaccoUser ?? false,
      isPregnant ?? false,
      isLead ?? false,
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
