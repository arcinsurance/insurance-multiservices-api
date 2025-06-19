const express = require('express');
const multer = require('multer');
const csvParser = require('csv-parser');
const fs = require('fs');
const path = require('path');
const router = express.Router();

const upload = multer({ dest: 'uploads/csv/' });

// Simulación de base de datos
let clients = [];

function findClientIndex(firstName, lastName) {
  return clients.findIndex(client =>
    client.firstName === firstName && client.lastName === lastName
  );
}

router.post('/', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No se subió ningún archivo' });
  }

  const results = [];
  const created = [];
  const updated = [];
  const errors = [];

  fs.createReadStream(req.file.path)
    .pipe(csvParser())
    .on('data', (data) => {
      try {
        const { firstName, lastName, email, phone } = data;
        if (!firstName || !lastName) throw new Error('Faltan nombre o apellido');

        const index = findClientIndex(firstName, lastName);
        if (index !== -1) {
          // Cliente ya existe, actualizar
          clients[index] = { ...clients[index], email, phone };
          updated.push(`${firstName} ${lastName}`);
        } else {
          // Nuevo cliente
          clients.push({ firstName, lastName, email, phone });
          created.push(`${firstName} ${lastName}`);
        }
      } catch (err) {
        errors.push(err.message);
      }
    })
    .on('end', () => {
      fs.unlinkSync(req.file.path); // borrar archivo temporal
      res.json({
        clientsCreated: created.length,
        clientsUpdated: updated.length,
        rowsFailed: errors.length,
        errors: errors.slice(0, 5),
      });
    });
});

module.exports = router;