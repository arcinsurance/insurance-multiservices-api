// src/controllers/settingsController.ts
import { Request, Response } from 'express';
import { db } from '../config/db';

// ──────── AGENCY PROFILE ────────

export const getAgencyProfile = async (req: Request, res: Response) => {
  try {
    const [rows] = await db.query('SELECT * FROM agency_profile LIMIT 1');
    const profile = Array.isArray(rows) && rows.length > 0 ? rows[0] : null;

    if (!profile) {
      return res.status(404).json({ message: 'Agency profile not found' });
    }

    res.json(profile);
  } catch (error) {
    console.error('Error fetching agency profile:', error);
    res.status(500).json({ message: 'Error retrieving agency profile' });
  }
};

export const updateAgencyProfile = async (req: Request, res: Response) => {
  const {
    agency_name,
    address,
    phone,
    email,
    contact_person,
    license_number,
  } = req.body;

  try {
    await db.query(`
      UPDATE agency_profile SET 
        agency_name = ?, 
        address = ?, 
        phone = ?, 
        email = ?, 
        contact_person = ?, 
        license_number = ?
      LIMIT 1
    `, [agency_name, address, phone, email, contact_person, license_number]);

    const [updatedRows] = await db.query('SELECT * FROM agency_profile LIMIT 1');
    res.json(updatedRows[0]);
  } catch (error) {
    console.error('Error updating agency profile:', error);
    res.status(500).json({ message: 'Error updating agency profile' });
  }
};

// ──────── APP SETTINGS ────────

export const getAppSettings = async (req: Request, res: Response) => {
  try {
    const [rows] = await db.query('SELECT * FROM app_settings LIMIT 1');
    const settings = Array.isArray(rows) && rows.length > 0 ? rows[0] : null;

    if (!settings) {
      return res.status(404).json({ message: 'App settings not found' });
    }

    // Convert values to proper types
    settings.email_notifications = !!settings.email_notifications;
    settings.e_signature = !!settings.e_signature;
    settings.sms_notifications = !!settings.sms_notifications;
    settings.two_factor_auth = !!settings.two_factor_auth;

    res.json(settings);
  } catch (error) {
    console.error('Error fetching app settings:', error);
    res.status(500).json({ message: 'Error retrieving app settings' });
  }
};

export const updateAppSettings = async (req: Request, res: Response) => {
  const {
    email_notifications,
    e_signature,
    sms_notifications,
    timezone,
    language,
    password_policy,
    two_factor_auth,
  } = req.body;

  try {
    await db.query(`
      UPDATE app_settings SET 
        email_notifications = ?, 
        e_signature = ?, 
        sms_notifications = ?, 
        timezone = ?, 
        language = ?, 
        password_policy = ?, 
        two_factor_auth = ?
      LIMIT 1
    `, [
      email_notifications,
      e_signature,
      sms_notifications,
      timezone,
      language,
      password_policy,
      two_factor_auth,
    ]);

    const [updatedRows] = await db.query('SELECT * FROM app_settings LIMIT 1');
    res.json(updatedRows[0]);
  } catch (error) {
    console.error('Error updating app settings:', error);
    res.status(500).json({ message: 'Error updating app settings' });
  }
};
