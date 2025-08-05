import { Request, Response } from 'express';
import {
  createAgent,
  getAllAgents,
  deleteAgent,
  deactivateAgent,
  activateAgent,
} from './agentController';

/*
 * User controller exposes an API surface that mirrors the requirements of the
 * frontend DataContext. Under the hood it delegates to the existing agent
 * controller since all current "users" in the CRM are agents. If in the
 * future the application distinguishes between admins, agents and other
 * user types, the functions here can be expanded accordingly.
 */

// Create a new user (agent)
export const createUser = async (req: Request, res: Response) => {
  // Delegate to createAgent
  return createAgent(req, res);
};

// Get all users (agents)
export const getUsers = async (req: Request, res: Response) => {
  return getAllAgents(req, res);
};

// Update user details. Delegates to agent update logic if implemented.
// Currently this implementation performs a simple update on the agents
// table and refreshes permissions and licenses. It mirrors the create
// logic but updates existing records.
import { db } from '../config/db';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

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

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    // If password provided, hash it; otherwise leave unchanged
    let hashedPassword: string | undefined;
    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }
    // Update agent core fields
    const fields: string[] = [];
    const values: any[] = [];
    if (fullName) {
      fields.push('full_name = ?');
      values.push(fullName);
    }
    if (email) {
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
    if (role) {
      fields.push('role = ?');
      values.push(role);
    }
    if (hashedPassword) {
      fields.push('password = ?');
      values.push(hashedPassword);
      // Reset must_change_password if new password provided
      fields.push('must_change_password = 0');
    }
    if (fields.length > 0) {
      await conn.execute(
        `UPDATE agents SET ${fields.join(', ')} WHERE id = ?`,
        [...values, id]
      );
    }
    // Update permissions: delete existing and reinsert
    await conn.execute('DELETE FROM agent_permissions WHERE agent_id = ?', [id]);
    for (const perm of permissions) {
      await conn.execute(
        'INSERT INTO agent_permissions (agent_id, permission_key) VALUES (?, ?)',
        [id, perm]
      );
    }
    // Update licenses: delete existing and reinsert
    await conn.execute('DELETE FROM agent_licenses WHERE agent_id = ?', [id]);
    for (const lic of licenses) {
      const { state, licenseNumber, expiryDate } = lic;
      await conn.execute(
        'INSERT INTO agent_licenses (agent_id, state, license_number, expiry_date) VALUES (?, ?, ?, ?)',
        [id, state, licenseNumber, expiryDate]
      );
    }
    await conn.commit();
    // Return updated agent using getAllAgents filtering by id
    const [rows] = await conn.query(
      `SELECT a.*,
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
       WHERE a.id = ?
       GROUP BY a.id`,
      [id]
    );
    if ((rows as any[]).length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    const agent = (rows as any[])[0];
    const updatedUser = {
      id: agent.id,
      fullName: agent.full_name,
      email: agent.email,
      phone: agent.phone,
      npn: agent.npn,
      role: agent.role,
      isActive: !!agent.is_active,
      permissions: agent.permissions ? JSON.parse(agent.permissions) : [],
      licenses: agent.licenses ? JSON.parse(agent.licenses) : [],
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

// Delete user
export const deleteUser = async (req: Request, res: Response) => {
  return deleteAgent(req, res);
};

// Update user status (activate/deactivate)
export const updateUserStatus = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { isActive } = req.body;
  if (isActive === undefined) {
    return res.status(400).json({ error: 'isActive field is required' });
  }
  if (isActive) {
    // Activate
    return activateAgent(req, res);
  } else {
    // Deactivate
    return deactivateAgent(req, res);
  }
};