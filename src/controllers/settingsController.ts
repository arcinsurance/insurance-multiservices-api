// src/controllers/settingsController.ts
import { Request, Response } from 'express';

let agencyProfile = {
  agencyName: 'Insurance Multiservices LLC',
  address: '7902 W Waters Ave, Ste. E, Tampa, FL 33615',
  phone: '813-885-5296',
  email: 'idealhealthinsurance@gmail.com',
  contactPerson: 'Yosanys P Guerra Valverde',
  licenseNumber: 'L123527',
};

let appSettings = {
  integrations: {
    emailNotifications: true,
    eSignature: false,
    smsNotifications: false,
  },
  general: {
    timezone: 'GMT-5 (Eastern Time)',
    language: 'es',
  },
  security: {
    passwordPolicy: 'Medium',
    twoFactorAuth: false,
  },
};

export const getAgencyProfile = (req: Request, res: Response) => {
  res.json(agencyProfile);
};

export const updateAgencyProfile = (req: Request, res: Response) => {
  agencyProfile = { ...agencyProfile, ...req.body };
  res.json(agencyProfile);
};

export const getAppSettings = (req: Request, res: Response) => {
  res.json(appSettings);
};

export const updateAppSettings = (req: Request, res: Response) => {
  appSettings = { ...appSettings, ...req.body };
  res.json(appSettings);
};
