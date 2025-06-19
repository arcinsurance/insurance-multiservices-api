
const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

router.get('/:fileName/content', (req, res) => {
  const fileName = req.params.fileName;
  const filePath = path.join(__dirname, '..', 'Templates', fileName);

  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error(`Error al leer la plantilla ${fileName}:`, err.message);
      return res.status(404).send('Plantilla no encontrada');
    }

    res.set('Content-Type', 'text/html');
    res.send(data);
  });
});

module.exports = router;
