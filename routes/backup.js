const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const multer = require('multer');

const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const upload = multer({ dest: uploadDir });

router.post('/restore', upload.single('backup'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file received' });
    }

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
