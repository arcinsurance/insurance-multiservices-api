import express from 'express';
import multer from 'multer';
import fs from 'fs';
import csvParser from 'csv-parser';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.post('/import-clients', upload.single('csvFile'), (req, res) => {
  const results = [];
  const filePath = req.file.path;

  fs.createReadStream(filePath)
    .pipe(csvParser())
    .on('data', (data) => {
      results.push(data);
    })
    .on('end', () => {
      fs.unlinkSync(filePath);
      res.json({
        message: 'Importación completada',
        total: results.length,
        sample: results.slice(0, 3)
      });
    })
    .on('error', (err) => {
      res.status(500).json({ error: 'Error al procesar el archivo CSV' });
    });
});

export default router;