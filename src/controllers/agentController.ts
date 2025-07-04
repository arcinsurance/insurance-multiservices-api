import { Request, Response } from 'express';
import { db } from '../config/db';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';
import { sendAgentWelcomeEmail } from '../utils/emailService';

/* ------------------------------------------------------------------ */
/* 1. Crear agente + permisos + licencias                              */
/* ------------------------------------------------------------------ */
export const createAgent = async (req: Request, res: Response) => {
  const conn = await db.getConnection();
  try {
    const {
      fullName,
      email,
      phone,
      npn,
      role = 'AGENT',
      permissions = [],
      licenses = [],
    } = req.body;

    const full_name = fullName;
    const agentId = uuidv4();

    const tempPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    await conn.beginTransaction();

    await conn.execute(
      `INSERT INTO agents
         (id, full_name, email, phone, npn, role, is_active, password, must_change_password)
       VALUES (?,  ?,         ?,     ?,    ?,   ?,    1,        ?,        1)`,
      [agentId, full_name, email, phone ?? null, npn ?? null, role, hashedPassword],
    );

    for (const perm of permissions) {
      await conn.execute(
        `INSERT INTO agent_permissions (agent_id, permission_key)
         VALUES (?, ?)`,
        [agentId, perm],
      );
    }

    for (const lic of licenses) {
      const { state, licenseNumber, expiryDate } = lic;
      await conn.execute(
        `INSERT INTO agent_licenses
           (agent_id, state, license_number, expiry_date)
         VALUES (?,        ?,     ?,             ?)`,
        [agentId, state, licenseNumber, expiryDate],
      );
    }

    await sendAgentWelcomeEmail(email, fullName, tempPassword);

    await conn.commit();

    res.status(201).json({
      id: agentId,
      fullName,
      email,
      phone,
      npn,
      role,
      isActive: true,
      permissions,
      licenses,
    });
  } catch (err) {
    await conn.rollback();
    console.error('Error creating agent:', err);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    conn.release();
  }
};

/* ------------------------------------------------------------------ */
/* 2. Obtener todos los agentes con permisos y licencias               */
/* ------------------------------------------------------------------ */
export const getAllAgents = async (_req: Request, res: Response) => {
  try {
    const [rows] = await db.query(`
      SELECT a.*,
             JSON_ARRAYAGG(DISTINCT ap.permission_key) AS permissions,
             JSON_ARRAYAGG(
               DISTINCT JSON_OBJECT(
                 'state',         al.state,
                 'licenseNumber', al.license_number,
                 'expiryDate',    al.expiry_date
               )
             ) AS licenses
      FROM agents a
      LEFT JOIN agent_permissions ap ON ap.agent_id = a.id
      LEFT JOIN agent_licenses    al ON al.agent_id = a.id
      GROUP BY a.id
    `);

    const agents = (rows as any[]).map(r => ({
      id: r.id,
      fullName: r.full_name,
      email: r.email,
      phone: r.phone,
      npn: r.npn,
      role: r.role,
      isActive: !!r.is_active,
      permissions: r.permissions ? JSON.parse(r.permissions) : [],
      licenses: r.licenses ? JSON.parse(r.licenses) : [],
    }));

    res.status(200).json(agents);
  } catch (err) {
    console.error('Error fetching agents:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/* ------------------------------------------------------------------ */
/* 3. Eliminar agente y sus relaciones                                 */
/* ------------------------------------------------------------------ */
export const deleteAgent = async (req: Request, res: Response) => {
  const { id } = req.params;
  const conn = await db.getConnection();

  try {
    await conn.beginTransaction();

    await conn.execute(`DELETE FROM agent_permissions WHERE agent_id = ?`, [id]);
    await conn.execute(`DELETE FROM agent_licenses WHERE agent_id = ?`, [id]);
    const [result] = await conn.execute(`DELETE FROM agents WHERE id = ?`, [id]);

    await conn.commit();

    const affected = (result as any).affectedRows;
    if (affected === 0) {
      return res.status(404).json({ error: 'Agent not found' });
    }

    res.status(200).json({ message: 'Agent deleted successfully' });
  } catch (err) {
    await conn.rollback();
    console.error('Error deleting agent:', err);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    conn.release();
  }
};
