import { Request, Response } from 'express';
import * as models from '../models';
import { isValid, parse, format } from 'date-fns';

const db = models;

/** ===================== Helpers ===================== **/

// Formato US MM/dd/yyyy
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

// Intenta construir un mapa idAgente -> full_name desde los modelos.
// Si el modelo Agent no existe o no expone getAgentsFromDB, retorna mapa vacío.
async function buildAgentsMap(): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  try {
    const hasAgentModel = (db as any)?.Agent && typeof (db as any).Agent.getAgentsFromDB === 'function';
    if (!hasAgentModel) return map;
    const agents = await (db as any).Agent.getAgentsFromDB();
    for (const a of agents || []) {
      if (a?.id) map.set(String(a.id), a.full_name || a.name || '');
    }
  } catch {
    // silencioso: si falla, devolvemos map vacío
  }
  return map;
}

/** ===================== CREAR CLIENTE ===================== **/
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

    // ¿Email ya existe?
    const allClients = await db.Client.getClientsFromDB();
    const exists = allClients.find((c: any) => c.email === email);
    if (exists) {
      return res.status(409).json({ error: 'Email already exists' });
    }

    // Fecha de nacimiento -> yyyy-MM-dd
    let dob = '';
    if (dateOfBirth) {
      const dateObj = typeof dateOfBirth === 'string'
        ? parse(dateOfBirth, 'yyyy-MM-dd', new Date())
        : dateOfBirth;
      dob = isValid(dateObj) ? format(dateObj, 'yyyy-MM-dd') : '';
    }

    // Resolver nombre completo del agente (si mandan assignedAgentId)
    let assignedAgentFullName: string | null = null;
    if (assignedAgentId) {
      const agentsMap = await buildAgentsMap();
      assignedAgentFullName = agentsMap.get(String(assignedAgentId)) || null;
    }

    // Datos para la tabla clients (columnas en snake_case)
    const clientData = {
      first_name: firstName,
      middle_name: middleName || null,
      last_name: lastName,
      last_name_2: lastName2 || null,
      name: `${firstName} ${lastName}`,
      email,
      phone,
      date_of_birth: dob || null,
      gender: gender || null,
      preferred_language: preferredLanguage || null,
      is_tobacco_user: isTobaccoUser ? 1 : 0,
      is_pregnant: isPregnant ? 1 : 0,
      assigned_agent_id: assignedAgentId || null,
      assigned_agent_full_name: assignedAgentFullName, // <<< importante
    };

    const newClient = await db.Client.createClientInDB(clientData);

    // Direcciones
    const dirArr: any[] = [];
    if (physicalAddress) dirArr.push({ ...physicalAddress, type: 'physical' });
    if (mailingAddress && !mailingAddressSameAsPhysical) dirArr.push({ ...mailingAddress, type: 'mailing' });
    const addresses = dirArr.length > 0
      ? await db.Address.createAddressesForClient(newClient.id, dirArr)
      : [];

    // Ingresos
    let incomes: any[] = [];
    if (incomeSources && Array.isArray(incomeSources) && incomeSources.length > 0) {
      incomes = await db.IncomeSource.createIncomeSourcesForClient(newClient.id, incomeSources);
    }

    // Inmigración
    let immigration: any = {};
    if (immigrationDetails) {
      immigration = await db.ImmigrationDetails.createImmigrationDetailsForClient(newClient.id, immigrationDetails);
    }

    res.status(201).json({
      ...newClient,
      assigned_agent_id: newClient.assigned_agent_id || assignedAgentId || null,
      assigned_agent_full_name: newClient.assigned_agent_full_name || assignedAgentFullName || null,
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

/** ===================== ACTUALIZAR CLIENTE ===================== **/
export const updateClient = async (req: Request, res: Response) => {
  try {
    const clientId = req.params.id || req.params.clientId;
    const updateFields = req.body;

    const client = await db.Client.getClientByIdFromDB(clientId);
    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }

    // Email único
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

    // Resolver nombre del agente si cambió el assignedAgentId
    let assignedAgentFullNameUpd = client.assigned_agent_full_name || null;
    if (updateFields.assignedAgentId !== undefined) {
      if (updateFields.assignedAgentId) {
        const agentsMap = await buildAgentsMap();
        assignedAgentFullNameUpd = agentsMap.get(String(updateFields.assignedAgentId)) || null;
      } else {
        assignedAgentFullNameUpd = null;
      }
    }

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
      is_tobacco_user: updateFields.isTobaccoUser !== undefined ? (updateFields.isTobaccoUser ? 1 : 0) : client.is_tobacco_user,
      is_pregnant: updateFields.isPregnant !== undefined ? (updateFields.isPregnant ? 1 : 0) : client.is_pregnant,
      assigned_agent_id:
        updateFields.assignedAgentId !== undefined ? updateFields.assignedAgentId : (client.assigned_agent_id || null),
      assigned_agent_full_name: assignedAgentFullNameUpd, // <<< importante
    });

    // Direcciones
    if (updateFields.physicalAddress) {
      await db.Address.updateAddressForClient(clientId, { ...updateFields.physicalAddress, type: 'physical' });
    }
    if (updateFields.mailingAddress) {
      await db.Address.updateAddressForClient(clientId, { ...updateFields.mailingAddress, type: 'mailing' });
    }
    const addresses = await db.Address.getAddressesByClientId(clientId);

    // Ingresos
    let incomes: any[] = [];
    if (updateFields.incomeSources && Array.isArray(updateFields.incomeSources)) {
      incomes = await db.IncomeSource.updateIncomeSourceForClient(clientId, updateFields.incomeSources);
    } else {
      incomes = await db.IncomeSource.getIncomeSourcesByClientId(clientId);
    }

    // Inmigración
    let immigration: any = {};
    if (updateFields.immigrationDetails) {
      immigration = await db.ImmigrationDetails.updateImmigrationDetailsForClient(clientId, updateFields.immigrationDetails);
    } else {
      immigration = await db.ImmigrationDetails.getImmigrationDetailsByClientId(clientId);
    }

    const updatedClient = await db.Client.getClientByIdFromDB(clientId);

    res.json({
      ...updatedClient,
      assigned_agent_id: updatedClient.assigned_agent_id,
      assigned_agent_full_name: updatedClient.assigned_agent_full_name || assignedAgentFullNameUpd || null,
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

/** ===================== TRAER TODOS LOS CLIENTES ===================== **/
export const getClients = async (_req: Request, res: Response) => {
  try {
    const [clients, agentsMap] = await Promise.all([
      db.Client.getClientsFromDB(),
      buildAgentsMap()
    ]);

    res.json(
      clients.map((client: any) => ({
        ...client,
        assigned_agent_id: client.assigned_agent_id || null,
        assigned_agent_full_name:
          (client.assigned_agent_full_name && String(client.assigned_agent_full_name).trim() !== '')
            ? client.assigned_agent_full_name
            : (client.assigned_agent_id ? agentsMap.get(String(client.assigned_agent_id)) || null : null),
        date_of_birth: formatDate(client.date_of_birth),
        date_added: formatDate(client.date_added),
      }))
    );
  } catch (error) {
    console.error('Error fetching clients:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/** ===================== TRAER UN CLIENTE POR ID ===================== **/
export const getClientById = async (req: Request, res: Response) => {
  try {
    const clientId = req.params.id || req.params.clientId;
    const client = await db.Client.getClientByIdFromDB(clientId);
    if (!client) return res.status(404).json({ error: 'Client not found' });

    const [addresses, incomes, immigration, agentsMap] = await Promise.all([
      db.Address.getAddressesByClientId(clientId),
      db.IncomeSource.getIncomeSourcesByClientId(clientId),
      db.ImmigrationDetails.getImmigrationDetailsByClientId(clientId),
      buildAgentsMap()
    ]);

    res.json({
      ...client,
      assigned_agent_id: client.assigned_agent_id || null,
      assigned_agent_full_name:
        (client.assigned_agent_full_name && String(client.assigned_agent_full_name).trim() !== '')
          ? client.assigned_agent_full_name
          : (client.assigned_agent_id ? agentsMap.get(String(client.assigned_agent_id)) || null : null),
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

/** ===================== ENDPOINTS REST POR SECCIÓN ===================== **/

// GET /api/clients/:id/basic-info
export const getClientBasicInfo = async (req: Request, res: Response) => {
  try {
    const clientId = req.params.id;
    const client = await db.Client.getClientByIdFromDB(clientId);
    if (!client) return res.status(404).json({ error: 'Client not found' });

    // enriquecer nombre de agente
    let assignedAgentFullName: string | null =
      client.assigned_agent_full_name || null;
    if ((!assignedAgentFullName || assignedAgentFullName.trim() === '') && client.assigned_agent_id) {
      const agentsMap = await buildAgentsMap();
      assignedAgentFullName = agentsMap.get(String(client.assigned_agent_id)) || null;
    }

    const { id, name, email, phone, date_of_birth, date_added, assigned_agent_id } = client;
    res.json({
      id,
      name,
      email,
      phone,
      date_of_birth: formatDate(date_of_birth),
      date_added: formatDate(date_added),
      assigned_agent_id: assigned_agent_id || null,
      assigned_agent_full_name: assignedAgentFullName || null,
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

// GET /api/clients/:id/employment
export const getClientEmployment = async (req: Request, res: Response) => {
  try {
    const clientId = req.params.id;
    const income = await db.IncomeSource.getIncomeSourcesByClientId(clientId);
    res.json(income || []);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

// GET /api/clients/:id/immigration
export const getClientImmigration = async (req: Request, res: Response) => {
  try {
    const clientId = req.params.id;
    const immigration = await db.ImmigrationDetails.getImmigrationDetailsByClientId(clientId);
    res.json(immigration || {});
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

// GET /api/clients/:id/addresses
export const getClientAddresses = async (req: Request, res: Response) => {
  try {
    const clientId = req.params.id;
    const addresses = await db.Address.getAddressesByClientId(clientId);
    res.json(addresses || []);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

// PUT /api/clients/:id/employment
export const updateClientEmployment = async (req: Request, res: Response) => {
  try {
    const clientId = req.params.id;
    const incomeArray = req.body;
    if (!Array.isArray(incomeArray)) {
      return res.status(400).json({ error: 'Expected an array of income sources.' });
    }
    const result = await db.IncomeSource.updateIncomeSourceForClient(clientId, incomeArray);
    res.json({ message: 'Employment info updated', result });
  } catch (error) {
    console.error('Error updating employment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// PUT /api/clients/:id/immigration
export const updateClientImmigration = async (req: Request, res: Response) => {
  try {
    const clientId = req.params.id;
    const immigration = req.body;
    const result = await db.ImmigrationDetails.updateImmigrationDetailsForClient(clientId, immigration);
    res.json({ message: 'Immigration info updated', result });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

// PUT /api/clients/:id/addresses
export const updateClientAddresses = async (req: Request, res: Response) => {
  try {
    const clientId = req.params.id;
    const address = req.body;
    const result = await db.Address.updateAddressForClient(clientId, address);
    res.json({ message: 'Address updated', result });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};
