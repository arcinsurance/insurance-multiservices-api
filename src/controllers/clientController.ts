// src/controllers/clientController.ts

import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import * as db from '../models';
import { isValid, parse, format } from 'date-fns';

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
      firstName, lastName, middleName, lastName2, email, phone, dateOfBirth, gender,
      assignedAgentId, preferredLanguage, isTobaccoUser, isPregnant,
      physicalAddress, mailingAddress, mailingAddressSameAsPhysical,
      incomeSources, immigrationDetails,
    } = req.body;

    if (!firstName || !lastName || !email || !phone) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    // Email único
    const exists = await db.Client.findOne({ where: { email } });
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

    const newClient = await db.Client.create({
      id: uuidv4(),
      firstName,
      lastName,
      middleName: middleName || null,
      lastName2: lastName2 || null,
      email,
      phone,
      dateOfBirth: dob,
      gender: gender || null,
      assignedAgentId: assignedAgentId || null,
      preferredLanguage: preferredLanguage || 'Spanish',
      isTobaccoUser: !!isTobaccoUser,
      isPregnant: !!isPregnant,
      dateAdded: new Date(),
    });

    // Direcciones (Address)
    if (physicalAddress) {
      await db.Address.create({ ...physicalAddress, clientId: newClient.id, type: 'physical' });
    }
    if (mailingAddress && !mailingAddressSameAsPhysical) {
      await db.Address.create({ ...mailingAddress, clientId: newClient.id, type: 'mailing' });
    }

    // Income sources
    if (incomeSources && Array.isArray(incomeSources)) {
      for (const source of incomeSources) {
        await db.IncomeSource.create({ ...source, clientId: newClient.id });
      }
    }

    // Immigration details
    if (immigrationDetails) {
      await db.ImmigrationDetails.create({ ...immigrationDetails, clientId: newClient.id });
    }

    // Trae todos los datos para el frontend
    const fullClient = await db.Client.findOne({
      where: { id: newClient.id },
      include: [
        { model: db.Address },
        { model: db.IncomeSource },
        { model: db.ImmigrationDetails },
      ],
    });

    res.status(201).json(fullClient);
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

    const client = await db.Client.findByPk(clientId);
    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }

    // Si cambia email, valida que no exista en otro cliente
    if (updateFields.email && updateFields.email !== client.email) {
      const exists = await db.Client.findOne({ where: { email: updateFields.email } });
      if (exists) {
        return res.status(409).json({ error: 'Email already exists' });
      }
    }

    // Si cambia fecha, normalízala
    if (updateFields.dateOfBirth) {
      const dateObj = typeof updateFields.dateOfBirth === 'string'
        ? parse(updateFields.dateOfBirth, 'yyyy-MM-dd', new Date())
        : updateFields.dateOfBirth;
      updateFields.dateOfBirth = isValid(dateObj) ? format(dateObj, 'yyyy-MM-dd') : null;
    }

    await client.update(updateFields);

    // Actualiza direcciones, ingresos, legal si están presentes
    if (updateFields.physicalAddress) {
      await db.Address.update(updateFields.physicalAddress, {
        where: { clientId, type: 'physical' }
      });
    }
    if (updateFields.mailingAddress) {
      await db.Address.update(updateFields.mailingAddress, {
        where: { clientId, type: 'mailing' }
      });
    }
    if (updateFields.incomeSources && Array.isArray(updateFields.incomeSources)) {
      await db.IncomeSource.destroy({ where: { clientId } }); // Borra anteriores y agrega nuevos
      for (const source of updateFields.incomeSources) {
        await db.IncomeSource.create({ ...source, clientId });
      }
    }
    if (updateFields.immigrationDetails) {
      await db.ImmigrationDetails.update(updateFields.immigrationDetails, { where: { clientId } });
    }

    // Trae el cliente actualizado
    const updatedClient = await db.Client.findOne({
      where: { id: clientId },
      include: [
        { model: db.Address },
        { model: db.IncomeSource },
        { model: db.ImmigrationDetails },
      ],
    });

    res.json(updatedClient);
  } catch (error) {
    console.error('Error updating client:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// ===================== TRAER TODOS LOS CLIENTES =====================
export const getClients = async (_req: Request, res: Response) => {
  try {
    const clients = await db.Client.findAll({
      include: [
        { model: db.Address },
        { model: db.IncomeSource },
        { model: db.ImmigrationDetails },
      ],
      order: [['dateAdded', 'DESC']],
    });

    res.json(
      clients.map((c: any) => ({
        ...c.toJSON(),
        dateOfBirth: formatDate(c.dateOfBirth),
        dateAdded: formatDate(c.dateAdded),
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
    const client = await db.Client.findOne({
      where: { id: clientId },
      include: [
        { model: db.Address },
        { model: db.IncomeSource },
        { model: db.ImmigrationDetails },
      ],
    });
    if (!client) return res.status(404).json({ error: 'Client not found' });
    res.json({
      ...client.toJSON(),
      dateOfBirth: formatDate(client.dateOfBirth),
      dateAdded: formatDate(client.dateAdded),
    });
  } catch (error) {
    console.error('Error fetching client:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
