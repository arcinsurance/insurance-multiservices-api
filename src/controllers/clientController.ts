/* src/controllers/clientController.ts */
import { Request, Response } from 'express';
import { db } from '../config/db';
import { v4 as uuidv4 } from 'uuid';

/* ───────────────────────── GET ALL ───────────────────────── */
export async function getClients(_req: Request, res: Response) {
  const [rows] = await db.query('SELECT * FROM clients ORDER BY date_added DESC');
  res.json(rows);
}

/* ───────────────────────── CREATE ────────────────────────── */
export async function createClient(req: Request, res: Response) {
  try {
    const data = req.body;

    /* 1️⃣ Validación mínima */
    if (!data.firstName || !data.lastName) {
      return res.status(400).json({
        message: 'firstName and lastName are required.'
      });
    }

    /* 2️⃣ Agente asignado (opcional) */
    const agentId: string | null = data.assignedAgentId ?? null;

    let agentFullName: string | null = null;
    if (agentId) {
      // Cambia "agents" por el nombre real de tu tabla de agentes si es distinto
      const [rows] = await db.query(
        'SELECT full_name FROM agents WHERE id = ?',
        [agentId]
      );
      if ((rows as any[]).length) {
        agentFullName = (rows as any[])[0].full_name ?? null;
      }
    }

    /* 3️⃣ Generar ID manual para evitar '' duplicados */
    const id = uuidv4();

    /* 4️⃣ Construir nombre completo */
    const fullName = [
      data.firstName,
      data.middleName,
      data.lastName,
      data.lastName2
    ]
      .filter(Boolean)
      .join(' ');

    /* 5️⃣ Insertar en BBDD */
    await db.execute(
      `INSERT INTO clients (
        id,
        agent_id,            assigned_agent_full_name,
        first_name,          middle_name,         last_name,      last_name_2,
        email,               phone,
        date_of_birth,       gender,              preferred_language,
        is_tobacco_user,     is_pregnant,         is_lead,
        name,
        date_added
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        id,
        agentId,
        agentFullName,
        data.firstName,
        data.middleName ?? null,
        data.lastName,
        data.lastName2 ?? null,
        data.email ?? null,
        data.phone ?? null,
        data.dateOfBirth ?? null,
        data.gender ?? null,
        data.preferredLanguage ?? null,
        data.isTobaccoUser ?? false,
        data.isPregnant ?? false,
        data.isLead ?? false,
        fullName
      ]
    );

    /* 6️⃣ Respuesta */
    res.status(201).json({ id });
  } catch (err) {
    console.error('Error creating client:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
}

/* ───────────────────────── UPDATE ────────────────────────── */
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
    isLead
  } = req.body;

  /* reconstruir nombre completo */
  const fullName = [firstName, middleName, lastName, lastName2]
    .filter(Boolean)
    .join(' ');

  await db.execute(
    `UPDATE clients SET
      first_name        = ?,  middle_name     = ?, last_name   = ?, last_name_2 = ?,
      email             = ?,  phone           = ?, date_of_birth = ?, gender = ?, preferred_language = ?,
      is_tobacco_user   = ?,  is_pregnant     = ?, is_lead     = ?,
      name              = ?
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
      fullName,
      id
    ]
  );

  res.sendStatus(204);
}

/* ───────────────────────── DELETE ────────────────────────── */
export async function deleteClient(req: Request, res: Response) {
  await db.execute('DELETE FROM clients WHERE id = ?', [req.params.id]);
  res.sendStatus(204);
}
/* ──────────────────────── GET BY ID ──────────────────────── */
export async function getClientById(req: Request, res: Response) {
  const { id } = req.params;

  try {
    const [rows] = await db.query('SELECT * FROM clients WHERE id = ?', [id]);

    if ((rows as any[]).length === 0) {
      return res.status(404).json({ message: 'Client not found' });
    }

    res.json((rows as any[])[0]);
  } catch (err) {
    console.error('Error fetching client by ID:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
}
