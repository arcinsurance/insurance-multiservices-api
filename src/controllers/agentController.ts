// src/controllers/agentController.ts
import { Request, Response } from 'express';
import { db } from '../config/db';

// Crear un nuevo agente y guardar sus permisos y licencias
export const createAgent = async (req: Request, res: Response) => {
  try {
    const { full_name, email, phone, npn, role, permissions = [], licenses = [] } = req.body;

    // Insertar agente
    const [result]: any = await db.execute(
      'INSERT INTO agents (full_name, email, phone, npn, role) VALUES (?, ?, ?, ?, ?)',
      [full_name, email, phone, npn, role]
    );

    const agentId = result.insertId.toString();

    // Insertar permisos
    for (const permission of permissions) {
      await db.execute(
        'INSERT INTO agent_permissions (agent_id, permission_key) VALUES (?, ?)',
        [agentId, permission]
      );
    }

    // Insertar licencias
    for (const license of licenses) {
      const { state, licenseNumber, expiryDate } = license;
      await db.execute(
        'INSERT INTO agent_licenses (agent_id, state, license_number, expiry_date) VALUES (?, ?, ?, ?)',
        [agentId, state, licenseNumber, expiryDate]
      );
    }

    res.status(201).json({ message: 'Agent created successfully', agentId });
  } catch (error) {
    console.error('Error creating agent:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Obtener todos los agentes con sus permisos y licencias
export const getAllAgents = async (_req: Request, res: Response) => {
  try {
    const [agents] = await db.execute('SELECT * FROM agents');
    const [permissions] = await db.execute('SELECT * FROM agent_permissions');
    const [licenses] = await db.execute('SELECT * FROM agent_licenses');

    const enrichedAgents = (agents as any[]).map(agent => {
      const agentPermissions = (permissions as any[]).filter(p => p.agent_id === agent.id);
      const agentLicenses = (licenses as any[]).filter(l => l.agent_id === agent.id);

      return {
        ...agent,
        permissions: agentPermissions.map(p => p.permission_key),
        licenses: agentLicenses.map(l => ({
          state: l.state,
          licenseNumber: l.license_number,
          expiryDate: l.expiry_date,
        })),
      };
    });

    res.status(200).json(enrichedAgents);
  } catch (error) {
    console.error('Error fetching agents:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
