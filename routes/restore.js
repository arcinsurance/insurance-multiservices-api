const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const mongoose = require('mongoose');

const upload = multer({ dest: 'tmp/' });

router.post('/upload', upload.single('backup'), async (req, res) => {
  try {
    const filePath = req.file.path;
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

    for (const [collectionName, documents] of Object.entries(data)) {
      const collection = mongoose.connection.db.collection(collectionName);
      await collection.deleteMany({});
      if (documents.length > 0) {
        await collection.insertMany(documents);
      }
    }

    fs.unlinkSync(filePath);
    res.status(200).json({ message: 'Backup restaurado exitosamente' });

  } catch (error) {
    console.error('Error al restaurar backup:', error);
    res.status(500).json({ message: 'Error al restaurar backup', error: error.message });
  }
});

module.exports = router;
