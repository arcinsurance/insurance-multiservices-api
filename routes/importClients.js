
import express from 'express';
import multer from 'multer';
import csvParser from 'csv-parser';

const router = express.Router();
const upload = multer();

router.post('/import-clients', upload.single('file'), async (req, res) => {
  try {
    const clients = [];
    const failed = [];

    req.pipe(csvParser())
      .on('data', (row) => {
        if (row.first_name && row.last_name && row.email) {
          clients.push(row);
        } else {
          failed.push({ row, error: "Missing required fields" });
        }
      })
      .on('end', () => {
        res.json({
          created: clients.length,
          failed: failed.length,
          errors: failed.slice(0, 5)
        });
      });
  } catch (error) {
    console.error('❌ CSV import error:', error.message);
    res.status(500).json({ error: 'Import failed' });
  }
});

export default router;
