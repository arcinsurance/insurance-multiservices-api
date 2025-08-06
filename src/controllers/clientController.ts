// src/controllers/clientController.ts

import { Request, Response } from 'express';
import * as models from '../models';
import { isValid, parse, format } from 'date-fns';

const db = models;

// Helper para formato de fecha US
function formatDate(dateString: string | Date): string {
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
      firstName, lastName, email, phone, dateOfBirth,
      physicalAddress, mailingAddress, mailingAddressSameAsPhysical,
      incomeSources, immigrationDetails,
    } = req.body;

    if (!firstName || !lastName || !email || !phone) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Buscar si existe el email (¡NO tenemos función directa!)
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

    // Crear cliente
    const clientData = {
      name: `${firstName} ${lastName}`,
      email,
      phone,
      date_of_birth: dob
    };
    const newClient = await db.Client.createClientInDB(clientData);

    // Crear direcciones
    if (physicalAddress) {
      await db.Address.createAddressForClient(newClient.id, { ...physicalAddress, type: 'physical' });
    }
    if (mailingAddress && !mailingAddressSameAsPhysical) {
      await db.Address.createAddressForClient(newClient.id, { ...mailingAddress, type: 'mailing' });
    }

    // Crear incomeSources
    if (incomeSources && Array.isArray(incomeSources)) {
      for (const source of incomeSources) {
        await db.IncomeSource.createIncomeSourceForClient(newClient.id, source);
      }
    }

    // Crear immigrationDetails
    if (immigrationDetails) {
      await db.ImmigrationDetails.createImmigrationDetailsForClient(newClient.id, immigrationDetails);
    }

    // Traer todo el cliente para el frontend (simulación, puedes ajustar)
    const addresses = await db.Address.getAddressesByClientId(newClient.id);
    const incomes = await db.IncomeSource.getIncomeSourcesByClientId(newClient.id);
    const immigration = await db.ImmigrationDetails.getImmigrationDetailsByClientId(newClient.id);

    res.status(201).json({
      ...newClient,
      addresses,
      incomes,
      immigration
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

    await db.Client.updateClientInDB(clientId, {
      name: `${updateFields.firstName || client.name.split(' ')[0]} ${updateFields.lastName || client.name.split(' ')[1] || ''}`,
      email: updateFields.email || client.email,
      phone: updateFields.phone || client.phone,
      date_of_birth: updateFields.dateOfBirth || client.date_of_birth
    });

    // Actualiza direcciones
    if (updateFields.physicalAddress) {
      await db.Address.updateAddressForClient(clientId, { ...updateFields.physicalAddress, type: 'physical' });
    }
    if (updateFields.mailingAddress) {
      await db.Address.updateAddressForClient(clientId, { ...updateFields.mailingAddress, type: 'mailing' });
    }

    // Actualiza incomeSources
    if (updateFields.incomeSources && Array.isArray(updateFields.incomeSources)) {
      // Podrías borrar e insertar de nuevo, según lo necesites
      for (const source of updateFields.incomeSources) {
        await db.IncomeSource.updateIncomeSourceForClient(clientId, source);
      }
    }

    // Actualiza immigrationDetails
    if (updateFields.immigrationDetails) {
      await db.ImmigrationDetails.updateImmigrationDetailsForClient(clientId, updateFields.immigrationDetails);
    }

    // Trae el cliente actualizado
    const updatedClient = await db.Client.getClientByIdFromDB(clientId);
    const addresses = await db.Address.getAddressesByClientId(clientId);
    const incomes = await db.IncomeSource.getIncomeSourcesByClientId(clientId);
    const immigration = await db.ImmigrationDetails.getImmigrationDetailsByClientId(clientId);

    res.json({
      ...updatedClient,
      addresses,
      incomes,
      immigration
    });
  } catch (error) {
    console.error('Error updating client:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// ===================== TRAER TODOS LOS CLIENTES =====================
export const getClients = async (_req: Request, res: Response) => {
  try {
    const clients = await db.Client.getClientsFromDB();
    res.json(clients);
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
      addresses,
      incomes,
      immigration
    });
  } catch (error) {
    console.error('Error fetching client:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
