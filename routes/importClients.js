
import express from 'express';
import multer from 'multer';
import csv from 'csv-parser';
import { Readable } from 'stream';

const router = express.Router();
const upload = multer();

function normalizeField(fieldName) {
  return fieldName.trim().toLowerCase().replace(/\s+/g, '_');
}

router.post('/import-clients', upload.single('csvFile'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No se subió ningún archivo CSV' });
    }

    const results = [];
    const failedRows = [];

    const stream = Readable.from(req.file.buffer);

    stream
      .pipe(csv())
      .on('data', (row) => {
        try {
          const normalizedRow = {};
          for (const key in row) {
            normalizedRow[normalizeField(key)] = row[key];
          }

          const client = {
            first_name: normalizedRow.first_name || '',
            last_name: normalizedRow.last_name || '',
            email: normalizedRow.email || '',
            phone_number: normalizedRow.phone || normalizedRow.phone_number || '',
            dob: normalizedRow.dob || '',
            address: normalizedRow.address || '',
            city: normalizedRow.city || '',
            state: normalizedRow.state || '',
            zip_code: normalizedRow.zip || normalizedRow.zip_code || '',
          };

          if (!client.first_name || !client.last_name) {
            throw new Error('Faltan nombres obligatorios');
          }

          results.push(client); // Aquí puedes agregar la lógica de guardado real
        } catch (err) {
          failedRows.push({ row, error: err.message });
        }
      })
      .on('end', () => {
        res.json({
          success: true,
          created: results.length,
          failed: failedRows.length,
          failedDetails: failedRows.slice(0, 1),
        });
      });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Error al procesar el archivo CSV' });
  }
});

export default router;
