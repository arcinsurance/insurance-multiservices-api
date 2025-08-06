import { Request, Response } from 'express';
import * as models from '../models';
import { isValid, parse, format } from 'date-fns';

const db = models;

// Helper para formato de fecha US
function formatDate(dateString: string | Date): string {
  if (!dateString) return '';
  try {
    const date = typeof dateString === 'string'
      ? parse(dateString, 'yyyy-MM-dd', new Date())
      : dateString;
    if (!isValid(date)) return '';
    return format(date, 'MM/dd/yyyy');
  } catch {
    return '';
  }
}

// ===================== CREAR CLIENTE =====================
export const createClient = async (req: Request, res: Response) => {
  try {
    const {
      firstName, middleName, lastName, lastName2, email, phone, dateOfBirth,
      gender, preferredLanguage, isTobaccoUser, isPregnant,
      assignedAgentId,
      physicalAddress, mailingAddress, mailingAddressSameAsPhysical,
      incomeSources, immigrationDetails,
    } = req.body;

    if (!firstName || !lastName || !email || !phone) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Buscar si existe el email
    const allClients = await db.Client.getClientsFromDB();
    const exists = allClients.find((c: any) => c.email === email);
    if (exists) {
      return res.status(409).json({ error: 'Email already exists' });
    }

    // Formatear fecha de nacimiento
    let dob = '';
    if (dateOfBirth) {
      const dateObj = typeof dateOfBirth === 'string'
        ? parse(dateOfBirth, 'yyyy-MM-dd', new Date())
        : dateOfBirth;
      dob = isValid(dateObj) ? format(dateObj, 'yyyy-MM-dd') : '';
    }

    // Mapeo completo de datos
    const clientData = {
      first_name: firstName,
      middle_name: middleName || null,
      last_name: lastName,
      last_name_2: lastName2 || null,
      name: `${firstName} ${lastName}`,
      email,
      phone,
      date_of_birth: dob,
      gender: gender || null,
      preferred_language: preferredLanguage || null,
      is_tobacco_user: isTobaccoUser ? 1 : 0,
      is_pregnant: isPregnant ? 1 : 0,
      assigned_agent_id: assignedAgentId || null,
    };

    const newClient = await db.Client.createClientInDB(clientData);

    // ==== GUARDAR DIRECCIONES ====
    let addresses: any[] = [];
    const dirArr = [];
    if (physicalAddress) dirArr.push({ ...physicalAddress, type: 'physical' });
    if (mailingAddress && !mailingAddressSameAsPhysical) dirArr.push({ ...mailingAddress, type: 'mailing' });
    if (dirArr.length > 0) {
      addresses = await db.Address.createAddressesForClient(newClient.id, dirArr);
    } else {
      addresses = [];
    }

    // ==== GUARDAR INGRESOS ====
    let incomes: any[] = [];
    if (incomeSources && Array.isArray(incomeSources) && incomeSources.length > 0) {
      incomes = await db.IncomeSource.createIncomeSourcesForClient(newClient.id, incomeSources);
    }

    // ==== GUARDAR DATOS MIGRATORIOS ====
    let immigration = {};
    if (immigrationDetails) {
      immigration = await db.ImmigrationDetails.createImmigrationDetailsForClient(newClient.id, immigrationDetails);
    }

    // ==== RESPUESTA ====
    res.status(201).json({
      ...newClient,
      assigned_agent_id: newClient.assigned_agent_id || assignedAgentId || null,
      date_of_birth: formatDate(newClient.date_of_birth),
      date_added: formatDate(newClient.date_added),
      addresses,
      incomes,
      immigration,
    });
  } catch (error) {
    console.error('Error creating client:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// ===================== ACTUALIZAR CLIENTE =====================
export const updateClient = async (req: Request, res: Response) => {
  try {
    const clientId = req.params.id || req.params.clientId;
    const updateFields = req.body;

    // Buscar cliente por ID
    const client = await db.Client.getClientByIdFromDB(clientId);
    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }

    // Validar email único
    if (updateFields.email && updateFields.email !== client.email) {
      const allClients = await db.Client.getClientsFromDB();
      const exists = allClients.find((c: any) => c.email === updateFields.email && c.id !== clientId);
      if (exists) {
        return res.status(409).json({ error: 'Email already exists' });
      }
    }

    // Normalizar fecha
    if (updateFields.dateOfBirth) {
      const dateObj = typeof updateFields.dateOfBirth === 'string'
        ? parse(updateFields.dateOfBirth, 'yyyy-MM-dd', new Date())
        : updateFields.dateOfBirth;
      updateFields.dateOfBirth = isValid(dateObj) ? format(dateObj, 'yyyy-MM-dd') : null;
    }

    // Mapeo completo de datos (mantén los valores anteriores si no llegan del frontend)
    await db.Client.updateClientInDB(clientId, {
      first_name: updateFields.firstName || client.first_name,
      middle_name: updateFields.middleName || client.middle_name,
      last_name: updateFields.lastName || client.last_name,
      last_name_2: updateFields.lastName2 || client.last_name_2,
      name: `${updateFields.firstName || client.first_name} ${updateFields.lastName || client.last_name}`,
      email: updateFields.email || client.email,
      phone: updateFields.phone || client.phone,
      date_of_birth: updateFields.dateOfBirth || client.date_of_birth,
      gender: updateFields.gender || client.gender,
      preferred_language: updateFields.preferredLanguage || client.preferred_language,
      is_tobacco_user: updateFields.isTobaccoUser !== undefined ? updateFields.isTobaccoUser : client.is_tobacco_user,
      is_pregnant: updateFields.isPregnant !== undefined ? updateFields.isPregnant : client.is_pregnant,
      assigned_agent_id: updateFields.assignedAgentId !== undefined
        ? updateFields.assignedAgentId
        : client.assigned_agent_id || null,
    });

    // ==== ACTUALIZAR DIRECCIONES ====
    if (updateFields.physicalAddress) {
      await db.Address.updateAddressForClient(clientId, { ...updateFields.physicalAddress, type: 'physical' });
    }
    if (updateFields.mailingAddress) {
      await db.Address.updateAddressForClient(clientId, { ...updateFields.mailingAddress, type: 'mailing' });
    }
    const addresses = await db.Address.getAddressesByClientId(clientId);

    // ==== ACTUALIZAR INGRESOS ====
    let incomes: any[] = [];
    if (updateFields.incomeSources && Array.isArray(updateFields.incomeSources)) {
      incomes = await db.IncomeSource.updateIncomeSourceForClient(clientId, updateFields.incomeSources);
    } else {
      incomes = await db.IncomeSource.getIncomeSourcesByClientId(clientId);
    }

    // ==== ACTUALIZAR DATOS MIGRATORIOS ====
    let immigration = {};
    if (updateFields.immigrationDetails) {
      immigration = await db.ImmigrationDetails.updateImmigrationDetailsForClient(clientId, updateFields.immigrationDetails);
    } else {
      immigration = await db.ImmigrationDetails.getImmigrationDetailsByClientId(clientId);
    }

    // ==== RESPUESTA ====
    const updatedClient = await db.Client.getClientByIdFromDB(clientId);

    res.json({
      ...updatedClient,
      assigned_agent_id: updatedClient.assigned_agent_id,
      date_of_birth: formatDate(updatedClient.date_of_birth),
      date_added: formatDate(updatedClient.date_added),
      addresses: addresses || [],
      incomes: incomes || [],
      immigration: immigration || {},
    });
  } catch (error) {
    console.error('Error updating client:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// ===================== TRAER TODOS LOS CLIENTES =====================
export const getClients = async (_req: Request, res: Response) => {
  try {
    // Si tienes una tabla de agentes y quieres el nombre, haz un JOIN aquí
    const clients = await db.Client.getClientsFromDB();
    res.json(
      clients.map((client: any) => ({
        ...client,
        assigned_agent_id: client.assigned_agent_id || null,
        date_of_birth: formatDate(client.date_of_birth),
        date_added: formatDate(client.date_added)
      }))
    );
  } catch (error) {
    console.error('Error fetching clients:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// ===================== TRAER UN CLIENTE POR ID =====================
export const getClientById = async (req: Request, res: Response) => {
  try {
    const clientId = req.params.id || req.params.clientId;
    const client = await db.Client.getClientByIdFromDB(clientId);
    if (!client) return res.status(404).json({ error: 'Client not found' });

    const addresses = await db.Address.getAddressesByClientId(clientId);
    const incomes = await db.IncomeSource.getIncomeSourcesByClientId(clientId);
    const immigration = await db.ImmigrationDetails.getImmigrationDetailsByClientId(clientId);

    res.json({
      ...client,
      assigned_agent_id: client.assigned_agent_id || null,
      date_of_birth: formatDate(client.date_of_birth),
      date_added: formatDate(client.date_added),
      addresses: addresses || [],
      incomes: incomes || [],
      immigration: immigration || {},
    });
  } catch (error) {
    console.error('Error fetching client:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// ... Los endpoints GET/PUT para info secciones y dirección/empleo/migración pueden quedar igual
