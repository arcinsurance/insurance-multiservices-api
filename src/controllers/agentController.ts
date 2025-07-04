import { Request, Response } from 'express';
import { db } from '../config/db';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';
import { sendAgentWelcomeEmail } from '../utils/emailService';

/* ------------------------------------------------------------------ */
/* 1. Crear agente + permisos + licencias                             */
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

    const agentId = uuidv4();
    const tempPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    await conn.beginTransaction();

    // 1. Insertar agente
    await conn.execute(
      `INSERT INTO agents
        (id, full_name, email, phone, npn, role, is_active, password, must_change_password)
       VALUES (?, ?, ?, ?, ?, ?, 1, ?, 1)`,
      [agentId, fullName, email, phone ?? null, npn ?? null, role, hashedPassword]
    );

    // 2. Insertar permisos
    for (const perm of permissions) {
      await conn.execute(
        `INSERT INTO agent_permissions (agent_id, permission_key)
         VALUES (?, ?)`,
        [agentId, perm]
      );
    }

    // 3. Insertar licencias
    for (const lic of licenses) {
      const { state, licenseNumber, expiryDate } = lic;
      await conn.execute(
        `INSERT INTO agent_licenses (agent_id, state, license_number, expiry_date)
         VALUES (?, ?, ?, ?)`,
        [agentId, state, licenseNumber, expiryDate]
      );
    }

    // 4. Enviar email con contraseña temporal
    await sendAgentWelcomeEmail(email, fullName, tempPassword)
