
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const multer = require('multer');

// 🔧 Crear carpeta uploads/ si no existe
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const upload = multer({ dest: uploadDir });

// ✅ Ruta para generar y descargar backup
router.get('/download', async (req, res) => {
  try {
    const collections = await mongoose.connection.db.listCollections().toArray();
    const backup = {};

    for (let col of collections) {
      const data = await mongoose.connection.db.collection(col.name).find().toArray();
      backup[col.name] = data;
    }

    const tmpDir = path.join(__dirname, '../tmp');
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir);

    const filePath = path.join(tmpDir, 'backup.json');
    fs.writeFileSync(filePath, JSON.stringify(backup, null, 2));

    res.download(filePath, 'backup_insurance_multiservices.json', () => {
      fs.unlinkSync(filePath);
    });
  } catch (error) {
    console.error('Error al generar backup manual:', error);
    res.status(500).json({ message: 'Error al generar backup', error: error.message });
  }
});

// ✅ Ruta para restaurar backup desde archivo
router.post('/restore', upload.single('backup'), async (req, res) => {
  try {
    const filePath = req.file.path;
    const rawData = fs.readFileSync(filePath);
    const backupData = JSON.parse(rawData);

    for (const collectionName in backupData) {
      const collection = mongoose.connection.db.collection(collectionName);
      await collection.deleteMany({});
      if (backupData[collectionName].length > 0) {
        await collection.insertMany(backupData[collectionName]);
      }
    }

    fs.unlinkSync(filePath);
    res.json({ message: 'Backup restaurado con éxito' });
  } catch (error) {
    console.error('Error restaurando backup:', error);
    res.status(500).json({ message: 'Error restaurando backup', error: error.message });
  }
});

module.exports = router;
