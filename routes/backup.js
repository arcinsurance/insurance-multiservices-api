const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Endpoint para descargar el backup manualmente
router.get('/download', async (req, res) => {
  try {
    const collections = await mongoose.connection.db.listCollections().toArray();
    const backup = {};

    for (let col of collections) {
      const data = await mongoose.connection.db.collection(col.name).find().toArray();
      backup[col.name] = data;
    }

    const tmpDir = path.join(__dirname, '../tmp');

    // 🔧 Crea la carpeta tmp si no existe
    if (!fs.existsSync(tmpDir)) {
      fs.mkdirSync(tmpDir);
    }

    const filePath = path.join(tmpDir, 'backup.json');
    fs.writeFileSync(filePath, JSON.stringify(backup, null, 2));

    res.download(filePath, 'backup_insurance_multiservices.json', () => {
      fs.unlinkSync(filePath); // Elimina el archivo temporal después de descargarlo
    });
  } catch (error) {
    console.error('Error al generar backup manual:', error);
    res.status(500).json({ message: 'Error al generar backup', error: error.message });
  }
});

module.exports = router;
