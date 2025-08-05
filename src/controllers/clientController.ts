import { Request, Response } from 'express';
import { db } from '../config/db';
import { v4 as uuidv4 } from 'uuid';

/* ─────────────── GET ALL ─────────────── */
export async function getClients(_req: Request, res: Response) {
  try {
    const [clients] = await db.query('SELECT * FROM clients ORDER BY date_added DESC') as unknown as [any[], any];
    const [incomes] = await db.query('SELECT * FROM income_sources') as unknown as [any[], any];
    const [immigrations] = await db.query('SELECT * FROM immigration_details') as unknown as [any[], any];
    const [addresses] = await db.query('SELECT * FROM addresses') as unknown as [any[], any];

    const clientsWithDetails = clients.map(client => ({
      ...client,
      incomeSources: incomes.filter(i => i.client_id === client.id),
      immigrationDetails: immigrations.find(i => i.client_id === client.id) || {},
      physicalAddress: addresses.find(a => a.client_id === client.id && a.type === 'physical') || {},
      mailingAddress: addresses.find(a => a.client_id === client.id && a.type === 'mailing') || {},
      mailingAddressSameAsPhysical: !addresses.some(a => a.client_id === client.id && a.type === 'mailing')
    }));

    res.json(clientsWithDetails);
  } catch (error) {
    console.error('Error getting clients:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
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
      const [rows] = await db.query('SELECT full_name FROM agents WHERE id = ?', [agentId]) as unknown as [any[], any];
      if (rows.length) {
        agentFullName = rows[0].full_name ?? null;
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
  try {
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
  } catch (error) {
    console.error('Error updating client:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

/* ─────────────── DELETE ─────────────── */
export async function deleteClient(req: Request, res: Response) {
  try {
    await db.execute('DELETE FROM clients WHERE id = ?', [req.params.id]);
    res.sendStatus(204);
  } catch (error) {
    console.error('Error deleting client:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

/* ─────────── GET BY ID ─────────── */
export async function getClientById(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const [clients] = await db.query('SELECT * FROM clients WHERE id = ?', [id]) as unknown as [any[], any];
    if (clients.length === 0) {
      return res.status(404).json({ message: 'Client not found' });
    }

    const [incomes] = await db.query('SELECT * FROM income_sources WHERE client_id = ?', [id]) as unknown as [any[], any];
    const [immigration] = await db.query('SELECT * FROM immigration_details WHERE client_id = ?', [id]) as unknown as [any[], any];
    const [addresses] = await db.query('SELECT * FROM addresses WHERE client_id = ?', [id]) as unknown as [any[], any];

    const client = clients[0];

    client.incomeSources = incomes;

    client.immigrationDetails = immigration[0] ? {
      status: immigration[0].status || '',
      category: immigration[0].category || '',
      ssn: immigration[0].ssn || '',
      uscisNumber: immigration[0].uscis_number || '',
      greenCardNumber: immigration[0].green_card_number || '',
      greenCardExpiryDate: immigration[0].green_card_expiry_date || '',
      workPermitCardNumber: immigration[0].work_permit_card_number || '',
      workPermitExpiryDate: immigration[0].work_permit_expiry_date || '',
      otherNote: immigration[0].other_note || ''
    } : {};

    client.physicalAddress = addresses.find((a: any) => a.type === 'physical') || {};
    client.mailingAddress = addresses.find((a: any) => a.type === 'mailing') || {};
    client.mailingAddressSameAsPhysical = !addresses.some((a: any) => a.type === 'mailing');

    res.json(client);
  } catch (error) {
    console.error('Error fetching client by ID:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

/* ─────────── EMPLOYMENT ─────────── */
export async function updateClientEmployment(req: Request, res: Response) {
  try {
    const clientId = req.params.id;
    let employmentData = req.body;

    if (employmentData && employmentData.incomeSources) {
      employmentData = employmentData.incomeSources;
    }

    if (!Array.isArray(employmentData)) {
      employmentData = [employmentData];
    }

    await db.execute('DELETE FROM income_sources WHERE client_id = ?', [clientId]);

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

    const [clients] = await db.query('SELECT * FROM clients WHERE id = ?', [clientId]) as unknown as [any[], any];
    const [income] = await db.query('SELECT * FROM income_sources WHERE client_id = ?', [clientId]) as unknown as [any[], any];
    const client = clients[0] || null;
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
  try {
    const clientId = req.params.id;
    const data = req.body;

    await db.execute('DELETE FROM immigration_details WHERE client_id = ?', [clientId]);

    if (
      data.status || data.category || data.ssn ||
      data.uscisNumber || data.greenCardNumber || data.greenCardExpiryDate ||
      data.workPermitCardNumber || data.workPermitExpiryDate || data.otherNote
    ) {
      await db.execute(
        `INSERT INTO immigration_details (
          client_id, status, category, ssn, uscis_number,
          green_card_number, green_card_expiry_date,
          work_permit_card_number, work_permit_expiry_date,
          other_note
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          clientId,
          data.status ?? null,
          data.category ?? null,
          data.ssn ?? null,
          data.uscisNumber ?? null,
          data.greenCardNumber ?? null,
          data.greenCardExpiryDate ?? null,
          data.workPermitCardNumber ?? null,
          data.workPermitExpiryDate ?? null,
          data.otherNote ?? null
        ]
      );
    }

    const [clients] = await db.query('SELECT * FROM clients WHERE id = ?', [clientId]) as unknown as [any[], any];
    const [immigration] = await db.query('SELECT * FROM immigration_details WHERE client_id = ?', [clientId]) as unknown as [any[], any];
    const client = clients[0] || null;
    if (client) {
      client.immigrationDetails = immigration[0] ? {
        status: immigration[0].status || '',
        category: immigration[0].category || '',
        ssn: immigration[0].ssn || '',
        uscisNumber: immigration[0].uscis_number || '',
        greenCardNumber: immigration[0].green_card_number || '',
        greenCardExpiryDate: immigration[0].green_card_expiry_date || '',
        workPermitCardNumber: immigration[0].work_permit_card_number || '',
        workPermitExpiryDate: immigration[0].work_permit_expiry_date || '',
        otherNote: immigration[0].other_note || ''
      } : {};
    }
    res.status(200).json(client);
  } catch (error) {
    console.error('Error updating immigration:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

/* ─────────── ADDRESSES (MODIFICADO) ─────────── */
export async function updateClientAddresses(req: Request, res: Response) {
  const clientId = req.params.id;
  const { addresses } = req.body;

  console.log('🟡 Body recibido en dirección:', req.body);

  try {
    await db.execute('DELETE FROM addresses WHERE client_id = ?', [clientId]);

    if (Array.isArray(addresses)) {
      for (const addr of addresses) {
        if (addr?.line1 || addr?.city || addr?.zip_code) {
          const [insertResult] = await db.execute(
            `INSERT INTO addresses (
              client_id, type, line1, line2, city, state, zip_code, country, county
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              clientId,
              addr.type ?? null,
              addr.line1 ?? null,
              addr.line2 ?? null,
              addr.city ?? null,
              addr.state ?? null,
              addr.zip_code ?? null,
              addr.country ?? null,
              addr.county ?? null
            ]
          );
          console.log(`✅ Dirección ${addr.type} insertada`);
        }
      }
    }

    const [clients] = await db.query('SELECT * FROM clients WHERE id = ?', [clientId]) as unknown as [any[], any];
    const [savedAddresses] = await db.query('SELECT * FROM addresses WHERE client_id = ?', [clientId]) as unknown as [any[], any];
    const client = clients[0] || null;

    if (client) {
      client.physicalAddress = savedAddresses.find((a: any) => a.type === 'physical') || {};
      client.mailingAddress = savedAddresses.find((a: any) => a.type === 'mailing') || {};
      client.mailingAddressSameAsPhysical = !savedAddresses.some((a: any) => a.type === 'mailing');
    }

    res.status(200).json(client);
  } catch (error) {
    console.error('❌ Error actualizando direcciones:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
