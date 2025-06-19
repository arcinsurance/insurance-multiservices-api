
const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

// GET /api/templates/:fileName/content
router.get('/:fileName/content', (req, res) => {
  const fileName = req.params.fileName;
  const filePath = path.join(__dirname, '..', 'templates', fileName);

  if (!fs.existsSync(filePath)) {
    return res.status(404).send('Plantilla no encontrada');
  }

  fs.readFile(filePath, 'utf8', (err, content) => {
    if (err) {
      return res.status(500).send('Error al leer la plantilla');
    }
    res.set('Content-Type', 'text/html');
    res.send(content);
  });
});

module.exports = router;
