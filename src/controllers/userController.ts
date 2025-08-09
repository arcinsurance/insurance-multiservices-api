import { Request, Response } from 'express';
import {
  createAgent,
  getAllAgents,
  deleteAgent,
  deactivateAgent,
  activateAgent,
} from './agentController';
import { db } from '../config/db';
import bcrypt from 'bcrypt';

/*
 * User controller expone un API que hoy delega en el agentController,
 * porque todos los "users" actuales son agentes.
 * Si luego hay más tipos de usuarios, se puede ampliar aquí.
 */

// -----------------------------------------------------------------------------
// Create
// -----------------------------------------------------------------------------
export const createUser = async (req: Request, res: Response) => {
  // Delegar en createAgent
  return createAgent(req, res);
};

// -----------------------------------------------------------------------------
// Read (listado)
// -----------------------------------------------------------------------------
export const getUsers = async (req: Request, res: Response) => {
  return getAllAgents(req, res);
};

// -----------------------------------------------------------------------------
// Update
// -----------------------------------------------------------------------------
// NOTA clave para el error en Render:
// Aquí normalizamos y validamos las licencias antes de reinsertarlas, para
// asegurar que `state` y `licenseNumber` no sean nulos ni vacíos.
// Si están vacíos, devolvemos 400 con un mensaje claro.
// También permitimos `expiryDate = null` si tu columna lo admite; si no la admite,
// considera alterar la tabla o poner una fecha por defecto.
export const updateUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  const {
    fullName,
    email,
    phone,
    npn,
    role,
    permissions = [],
    licenses = [],
    password,
  } = req.body;

  // --- Normalización y validación de licencias ---
  type RawLic = any;
  const normLicenses = (Array.isArray(licenses) ? licenses : []).map((lic: RawLic) => {
    const state = (lic.state ?? lic.State ?? lic.licState ?? '').toString().trim();
    const licenseNumber = (lic.licenseNumber ?? lic.license_number ?? '').toString().trim();
    // expiryDate puede venir vacío -> guardamos NULL en DB si la columna lo permite
    const expiryDateRaw = lic.expiryDate ?? lic.expiry_date ?? '';
    const expiryDate =
      expiryDateRaw ? new Date(expiryDateRaw).toISOString().slice(0, 10) : null; // YYYY-MM-DD o null

    return { state, licenseNumber, expiryDate };
  });

  // Requerimos state y licenseNumber no vacíos
  const invalid = normLicenses.filter((l) => !l.state || !l.licenseNumber);
  if (invalid.length > 0) {
    return res.status(400).json({
      error: 'Each license must include non-empty `state` and `licenseNumber`',
      invalidCount: invalid.length,
    });
  }

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    // --- Password opcional ---
    let hashedPassword: string | undefined;
    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    // --- Update de agente (solo campos presentes para no pisar valores con null) ---
    const fields: string[] = [];
    const values: any[] = [];

    if (fullName !== undefined) {
      fields.push('full_name = ?');
      values.push(fullName);
    }
    if (email !== undefined) {
      fields.push('email = ?');
      values.push(email);
    }
    if (phone !== undefined) {
      fields.push('phone = ?');
      values.push(phone);
    }
    if (npn !== undefined) {
      fields.push('npn = ?');
      values.push(npn);
    }
    if (role !== undefined) {
      fields.push('role = ?');
      values.push(role);
    }
    if (hashedPassword) {
      fields.push('password = ?');
      values.push(hashedPassword);
      // Si cambias el password, el usuario ya no necesita cambiarlo al entrar
      fields.push('must_change_password = 0');
    }

    if (fields.length > 0) {
      await conn.execute(`UPDATE agents SET ${fields.join(', ')} WHERE id = ?`, [
        ...values,
        id,
      ]);
    }

    // --- Permisos: borramos y reinsertamos atómicamente ---
    await conn.execute('DELETE FROM agent_permissions WHERE agent_id = ?', [id]);
    if (Array.isArray(permissions) && permissions.length > 0) {
      for (const perm of permissions) {
        await conn.execute(
          'INSERT INTO agent_permissions (agent_id, permission_key) VALUES (?, ?)',
          [id, String(perm)]
        );
      }
    }

    // --- Licencias: borramos y reinsertamos (ya validadas) ---
    await conn.execute('DELETE FROM agent_licenses WHERE agent_id = ?', [id]);
    for (const lic of normLicenses) {
      await conn.execute(
        'INSERT INTO agent_licenses (agent_id, state, license_number, expiry_date) VALUES (?, ?, ?, ?)',
        [id, lic.state, lic.licenseNumber, lic.expiryDate] // expiryDate puede ser null si la columna lo permite
      );
    }

    await conn.commit();

    // --- Devolvemos el agente actualizado con permisos y licencias agregadas ---
    // Evitamos empujar objetos nulos a JSON_ARRAYAGG.
    const [rows] = await conn.query(
      `SELECT
         a.*,
         JSON_ARRAYAGG(DISTINCT ap.permission_key) AS permissions,
         JSON_ARRAYAGG(
           DISTINCT CASE
             WHEN al.state IS NULL THEN NULL
             ELSE JSON_OBJECT(
               'state',         al.state,
               'licenseNumber', al.license_number,
               'expiryDate',    al.expiry_date
             )
           END
         ) AS licenses
       FROM agents a
       LEFT JOIN agent_permissions ap ON ap.agent_id = a.id
       LEFT JOIN agent_licenses    al ON al.agent_id = a.id
       WHERE a.id = ?
       GROUP BY a.id`,
      [id]
    );

    if ((rows as any[]).length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const agent = (rows as any[])[0];
    const parsedPerms = agent.permissions ? JSON.parse(agent.permissions) : [];
    const parsedLicenses = agent.licenses
      ? (JSON.parse(agent.licenses) as any[]).filter(Boolean)
      : [];

    const updatedUser = {
      id: agent.id,
      fullName: agent.full_name,
      email: agent.email,
      phone: agent.phone,
      npn: agent.npn,
      role: agent.role,
      isActive: !!agent.is_active,
      permissions: parsedPerms,
      licenses: parsedLicenses,
    };

    return res.json(updatedUser);
  } catch (err) {
    await conn.rollback();
    console.error('Error updating user:', err);
    return res.status(500).json({ error: 'Internal server error' });
  } finally {
    conn.release();
  }
};

// -----------------------------------------------------------------------------
// Delete
// -----------------------------------------------------------------------------
export const deleteUser = async (req: Request, res: Response) => {
  return deleteAgent(req, res);
};

// -----------------------------------------------------------------------------
// Update status (activate/deactivate)
// -----------------------------------------------------------------------------
export const updateUserStatus = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { isActive } = req.body;

  if (isActive === undefined) {
    return res.status(400).json({ error: 'isActive field is required' });
  }

  if (isActive) {
    return activateAgent(req, res);
  } else {
    return deactivateAgent(req, res);
  }
};
