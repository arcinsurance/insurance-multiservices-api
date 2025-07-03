// src/controllers/agentController.ts
import { Request, Response } from 'express';
import { db } from '../config/db';
import { v4 as uuidv4 } from 'uuid';

/** Crear un agente + permisos + licencias */
export const createAgent = async (req: Request, res: Response) => {
  const conn = await db.getConnection();
  try {
    const {
      full_name,
      email,
      phone,
      npn,
      role = 'agent',
      permissions = [],
      licenses = [],
    } = req.body;

    await conn.beginTransaction();

    const agentId = uuidv4();

    await conn.execute(
      `INSERT INTO agents (id, full_name, email, phone, npn, role)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [agentId, full_name, email, phone ?? null, npn ?? null, role]
    );

    for (const perm of permissions) {
      await conn.execute(
        `INSERT INTO agent_permissions (agent_id, permission_key)
         VALUES (?, ?)`,
        [agentId, perm]
      );
    }

    for (const lic of licenses) {
      const { state, licenseNumber, expiryDate } = lic;
      await conn.execute(
        `INSERT INTO agent_licenses (agent_id, state, license_number, expiry_date)
         VALUES (?, ?, ?, ?)`,
        [agentId, state, licenseNumber, expiryDate]
      );
    }

    await conn.commit();
    res.status(201).json({ message: 'Agent created', agentId });

  } catch (err) {
    await conn.rollback();
    console.error('Error creating agent:', err);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    conn.release();
  }
};

/** Traer agentes con sus permisos y licencias */
export const getAllAgents = async (_req: Request, res: Response) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        a.*,
        COALESCE(
          JSON_ARRAYAGG(DISTINCT ap.permission_key),
          JSON_ARRAY()
        ) AS permissions,
        COALESCE(
          JSON_ARRAYAGG(
            DISTINCT JSON_OBJECT(
              'state', al.state,
              'licenseNumber', al.license_number,
              'expiryDate', al.expiry_date
            )
          ),
          JSON_ARRAY()
        ) AS licenses
      FROM agents a
      LEFT JOIN agent_permissions ap ON ap.agent_id = a.id
      LEFT JOIN agent_licenses al ON al.agent_id = a.id
      GROUP BY a.id
    `);

    res.status(200).json(rows);
  } catch (err) {
    console.error('Error fetching agents:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};
