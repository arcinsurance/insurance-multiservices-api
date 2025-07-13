import { Request, Response } from 'express';
import { db } from '../config/db';
import { v4 as uuidv4 } from 'uuid';

/* ─────────────── GET ALL (Incluye incomeSources) ─────────────── */
export async function getClients(_req: Request, res: Response) {
  // Trae todos los clientes
  const [clients] = await db.query('SELECT * FROM clients ORDER BY date_added DESC');

  // Trae todos los income_sources de una vez
  const [incomes] = await db.query('SELECT * FROM income_sources');

  // Une empleos por client_id
  const clientsWithIncome = (clients as any[]).map(client => ({
    ...client,
    incomeSources: (incomes as any[]).filter(i => i.client_id === client.id)
  }));

  res.json(clientsWithIncome);
}

/* ─────────────── CREATE ─────────────── */
export async function createClient(req: Request, res: Response) {
  try {
    const data = req.body;

    if (!data.firstName || !data.lastName) {
      return res.status(400).json({ message: 'firstName and lastName are required.' });
    }

    const agentId: string | null = data.assignedAgentId ?? null;
    let agentFullName: string | null = null;

    if (agentId) {
      const [rows] = await db.query('SELECT full_name FROM agents WHERE id = ?', [agentId]);
      if ((rows as any[]).length) {
        agentFullName = (rows as any[])[0].full_name ?? null;
      }
    }

    const id = uuidv4();
    const fullName = [data.firstName, data.middleName, data.lastName, data.lastName2].filter(Boolean).join(' ');

    await db.execute(
      `INSERT INTO clients (
        id, agent_id, assigned_agent_full_name,
        first_name, middle_name, last_name, last_name_2,
        email, phone, date_of_birth, gender, preferred_language,
        is_tobacco_user, is_pregnant, is_lead, name, date_added
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        id, agentId, agentFullName,
        data.firstName, data.middleName ?? null, data.lastName, data.lastName2 ?? null,
        data.email ?? null, data.phone ?? null,
        data.dateOfBirth ?? null, data.gender ?? null, data.preferredLanguage ?? null,
        data.isTobaccoUser ?? false, data.isPregnant ?? false, data.isLead ?? false,
        fullName
      ]
    );

    res.status(201).json({ id });
  } catch (err) {
    console.error('Error creating client:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
}

/* ─────────────── UPDATE ─────────────── */
export async function updateClient(req: Request, res: Response) {
  const { id } = req.params;
  const {
    firstName, middleName, lastName, lastName2,
    email, phone, dateOfBirth, gender, preferredLanguage,
    isTobaccoUser, isPregnant, isLead
  } = req.body;

  const fullName = [firstName, middleName, lastName, lastName2].filter(Boolean).join(' ');

  await db.execute(
    `UPDATE clients SET
      first_name = ?, middle_name = ?, last_name = ?, last_name_2 = ?,
      email = ?, phone = ?, date_of_birth = ?, gender = ?, preferred_language = ?,
      is_tobacco_user = ?, is_pregnant = ?, is_lead = ?, name = ?
     WHERE id = ?`,
    [
      firstName, middleName ?? null, lastName, lastName2 ?? null,
      email ?? null, phone ?? null, dateOfBirth ?? null, gender ?? null, preferredLanguage ?? null,
      isTobaccoUser ?? false, isPregnant ?? false, isLead ?? false,
      fullName, id
    ]
  );

  res.sendStatus(204);
}

/* ─────────────── DELETE ─────────────── */
export async function deleteClient(req: Request, res: Response) {
  await db.execute('DELETE FROM clients WHERE id = ?', [req.params.id]);
  res.sendStatus(204);
}

/* ─────────────── GET BY ID (Incluye incomeSources) ─────────────── */
export async function getClientById(req: Request, res: Response) {
  const { id } = req.params;

  try {
    const [clients] = await db.query('SELECT * FROM clients WHERE id = ?', [id]);
    if ((clients as any[]).length === 0) {
      return res.status(404).json({ message: 'Client not found' });
    }
    // Trae income_sources de este cliente
    const [incomes] = await db.query('SELECT * FROM income_sources WHERE client_id = ?', [id]);
    const client = (clients as any[])[0];
    client.incomeSources = incomes;
    res.json(client);
  } catch (err) {
    console.error('Error fetching client by ID:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
}

/* ─────────── EMPLOYMENT (corregido y devuelve cliente actualizado) ─────────── */
export async function updateClientEmployment(req: Request, res: Response) {
  const clientId = req.params.id;
  let employmentData = req.body;

  // Si se envía el array envuelto en un objeto, tomarlo
  if (employmentData && employmentData.incomeSources) {
    employmentData = employmentData.incomeSources;
  }

  // Asegura que SIEMPRE sea un array
  if (!Array.isArray(employmentData)) {
    if (employmentData && typeof employmentData === 'object') {
      employmentData = [employmentData];
    } else {
      employmentData = [];
    }
  }

  try {
    // Elimina los registros antiguos de ese cliente
    await db.execute('DELETE FROM income_sources WHERE client_id = ?', [clientId]);

    // Inserta los nuevos registros válidos
    const validSources = employmentData.filter(
      (src: any) => src && (src.employerOrSelfEmployed || src.positionOccupation || src.annualIncome)
    );

    for (const source of validSources) {
      await db.execute(
        `INSERT INTO income_sources 
          (client_id, employerOrSelfEmployed, employerPhoneNumber, positionOccupation, annualIncome)
         VALUES (?, ?, ?, ?, ?)`,
        [
          clientId,
          source.employerOrSelfEmployed ?? null,
          source.employerPhoneNumber ?? null,
          source.positionOccupation ?? null,
          source.annualIncome ?? null
        ]
      );
    }

    // --- DEVUELVE el cliente actualizado (incluye empleos) ---
    const [clients] = await db.query('SELECT * FROM clients WHERE id = ?', [clientId]);
    const [income] = await db.query('SELECT * FROM income_sources WHERE client_id = ?', [clientId]);
    const client = (clients as any[])[0] || null;
    if (client) {
      client.incomeSources = income;
    }
    res.status(200).json(client);

  } catch (error) {
    console.error('Error updating employment:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

/* ─────────── IMMIGRATION ─────────── */
export async function updateClientImmigration(req: Request, res: Response) {
  const clientId = req.params.id;
  const data = req.body;

  try {
    await db.execute('DELETE FROM immigration_details WHERE client_id = ?', [clientId]);

    if (data.status || data.category || data.ssn || data.uscisNumber) {
      await db.execute(
        `INSERT INTO immigration_details (client_id, status, category, ssn, uscis_number)
         VALUES (?, ?, ?, ?, ?)`,
        [
          clientId,
          data.status ?? null,
          data.category ?? null,
          data.ssn ?? null,
          data.uscisNumber ?? null
        ]
      );
    }

    res.sendStatus(204);
  } catch (error) {
    console.error('Error updating immigration:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

/* ─────────── ADDRESSES ─────────── */
export async function updateClientAddresses(req: Request, res: Response) {
  const clientId = req.params.id;
  const { physicalAddress, mailingAddress, mailingSameAsPhysical } = req.body;

  try {
    await db.execute('DELETE FROM addresses WHERE client_id = ?', [clientId]);

    if (physicalAddress?.line1 || physicalAddress?.city || physicalAddress?.zipCode) {
      await db.execute(
        `INSERT INTO addresses (client_id, type, line1, line2, city, state, zip_code)
         VALUES (?, 'physical', ?, ?, ?, ?, ?)`,
        [
          clientId,
          physicalAddress.line1 ?? null,
          physicalAddress.line2 ?? null,
          physicalAddress.city ?? null,
          physicalAddress.state ?? null,
          physicalAddress.zipCode ?? null
        ]
      );
    }

    if (!mailingSameAsPhysical && (mailingAddress?.line1 || mailingAddress?.city || mailingAddress?.zipCode)) {
      await db.execute(
        `INSERT INTO addresses (client_id, type, line1, line2, city, state, zip_code)
         VALUES (?, 'mailing', ?, ?, ?, ?, ?)`,
        [
          clientId,
          mailingAddress.line1 ?? null,
          mailingAddress.line2 ?? null,
          mailingAddress.city ?? null,
          mailingAddress.state ?? null,
          mailingAddress.zipCode ?? null
        ]
      );
    }

    res.sendStatus(204);
  } catch (error) {
    console.error('Error updating addresses:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
