// src/controllers/agentController.ts
import { Request, Response } from 'express';
import { db } from '../config/db';
import { v4 as uuidv4 } from 'uuid';

/* -------------------------------------------------------- */
/* 1.  Crear agente + permisos + licencias                   */
/* -------------------------------------------------------- */
export const createAgent = async (req: Request, res: Response) => {
  const conn = await db.getConnection();
  try {
    const {
  fullName,
  email,
  phone,
  npn,
  role = 'agent',
  permissions = [],
  licenses = [],
} = req.body;

const full_name = fullName; // mapeo para mantener compatibilidad con la BD


    await conn.beginTransaction();

    // generamos UUID nosotros mismos
    const agentId = uuidv4();

    /* ---------- Agente ---------- */
    await conn.execute(
      `INSERT INTO agents (id, full_name, email, phone, npn, role)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [agentId, full_name, email, phone ?? null, npn ?? null, role],
    );

    /* ---------- Permisos ---------- */
    for (const perm of permissions) {
      await conn.execute(
        `INSERT INTO agent_permissions (agent_id, permission_key)
         VALUES (?, ?)`,
        [agentId, perm],
      );
    }

    /* ---------- Licencias ---------- */
    for (const lic of licenses) {
      const { state, licenseNumber, expiryDate } = lic;
      await conn.execute(
        `INSERT INTO agent_licenses (agent_id, state, license_number, expiry_date)
         VALUES (?, ?, ?, ?)`,
        [agentId, state, licenseNumber, expiryDate],
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

/* -------------------------------------------------------- */
/* 2.  Obtener todos los agentes, con permisos y licencias   */
/* -------------------------------------------------------- */
export const getAllAgents = async (_req: Request, res: Response) => {
  try {
    const [rows] = await db.query(`
      SELECT  a.*,
              JSON_ARRAYAGG(DISTINCT ap.permission_key)           AS permissions,
              JSON_ARRAYAGG(
                  DISTINCT JSON_OBJECT(
                    'state',        al.state,
                    'licenseNumber',al.license_number,
                    'expiryDate',   al.expiry_date
                  )
              )                                                    AS licenses
      FROM agents a
      LEFT JOIN agent_permissions ap ON ap.agent_id = a.id
      LEFT JOIN agent_licenses    al ON al.agent_id = a.id
      GROUP BY a.id
    `);

    /* 👇  Convertir strings JSON a arrays reales */
    const agents = (rows as any[]).map((r) => ({
      ...r,
      permissions: r.permissions ? JSON.parse(r.permissions) : [],
      licenses:    r.licenses    ? JSON.parse(r.licenses)    : [],
    }));

    res.status(200).json(agents);
  } catch (err) {
    console.error('Error fetching agents:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};
