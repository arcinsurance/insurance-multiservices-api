import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import TemplateModel from '../utils/templateModel.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const templatesDir = path.join(__dirname, '../templates');

export const uploadTemplate = async (req, res) => {
  const { displayName } = req.body;
  const file = req.file;

  if (!file || !file.originalname.endsWith('.html')) {
    return res.status(400).json({ error: 'Solo se permiten archivos .html' });
  }

  const newFileName = file.originalname;
  const destPath = path.join(templatesDir, newFileName);
  fs.renameSync(file.path, destPath);

  await TemplateModel.create({
    fileName: newFileName,
    displayName,
    uploadedAt: new Date()
  });

  res.json({ message: 'Plantilla subida correctamente', fileName: newFileName });
};

export const listTemplates = async (req, res) => {
  const templates = await TemplateModel.find({}, 'fileName displayName');
  res.json(templates);
};
