import { Request, Response } from 'express';
import { db } from '../config/db';
import { RowDataPacket } from 'mysql2';

/* ───────────── AGENCY PROFILE ───────────── */

export const getAgencyProfile = async (req: Request, res: Response) => {
  try {
    const [rows] = await db.query<RowDataPacket[]>('SELECT * FROM agency_profile LIMIT 1');
    if (rows.length > 0) {
      const agency = rows[0];

      // Mapping para el frontend
      const formattedAgency = {
        ...agency,
        logoUrl: agency.logo_url || '',                   // string vacío si no hay logo
        name: agency.agency_name || '',                   // string vacío si falta
        contactPerson: agency.contact_person || '',        // string vacío si falta
        agencyId: agency.license_number || '',            // string vacío si falta
      };

      res.json(formattedAgency);
    } else {
      res.status(404).json({ message: 'Agency profile not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error fetching agency profile', error });
  }
};

export const updateAgencyProfile = async (req: Request, res: Response) => {
  const {
    name,
    address,
    phone,
    email,
    contactPerson,
    agencyId,
    logoUrl,
  } = req.body;

  try {
    await db.query(
      `UPDATE agency_profile SET 
        agency_name = ?, 
        address = ?, 
        phone = ?, 
        email = ?, 
        contact_person = ?, 
        license_number = ?,
        logo_url = ?
      LIMIT 1`,
      [name, address, phone, email, contactPerson, agencyId, logoUrl]
    );

    const [updated] = await db.query<RowDataPacket[]>('SELECT * FROM agency_profile LIMIT 1');
    const agency = updated[0];
    const formattedAgency = {
      ...agency,
      logoUrl: agency.logo_url || '',
      name: agency.agency_name || '',
      contactPerson: agency.contact_person || '',
      agencyId: agency.license_number || '',
    };
    res.json(formattedAgency);
  } catch (error) {
    res.status(500).json({ message: 'Error updating agency profile', error });
  }
};

/* ───────────── APP SETTINGS ───────────── */

export const getAppSettings = async (req: Request, res: Response) => {
  try {
    const [rows] = await db.query<RowDataPacket[]>('SELECT * FROM app_settings WHERE id = 1');
    if (rows.length > 0) {
      const settings = rows[0];

      const formatted = {
        integrations: {
          emailNotifications: !!settings.email_notifications,
          eSignature: !!settings.e_signature,
          smsNotifications: !!settings.sms_notifications,
        },
        general: {
          timezone: settings.timezone,
          language: settings.language,
        },
        security: {
          passwordPolicy: settings.password_policy,
          twoFactorAuth: !!settings.two_factor_auth,
        },
      };

      res.json(formatted);
    } else {
      res.status(404).json({ message: 'App settings not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error fetching app settings', error });
  }
};

export const updateAppSettings = async (req: Request, res: Response) => {
  const { integrations, general, security } = req.body;

  try {
    await db.query(
      `UPDATE app_settings SET 
        email_notifications = ?, 
        e_signature = ?, 
        sms_notifications = ?, 
        timezone = ?, 
        language = ?, 
        password_policy = ?, 
        two_factor_auth = ? 
      WHERE id = 1`,
      [
        integrations.emailNotifications,
        integrations.eSignature,
        integrations.smsNotifications,
        general.timezone,
        general.language,
        security.passwordPolicy,
        security.twoFactorAuth,
      ]
    );

    const [updated] = await db.query<RowDataPacket[]>('SELECT * FROM app_settings WHERE id = 1');
    res.json(updated[0]);
  } catch (error) {
    res.status(500).json({ message: 'Error updating app settings', error });
  }
};
