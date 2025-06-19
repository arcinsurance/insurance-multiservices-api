
const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

const templatesDir = path.join(__dirname, '../uploads/templates');

router.get('/:fileName/content', (req, res) => {
  const filePath = path.join(templatesDir, req.params.fileName);
  if (!fs.existsSync(filePath)) {
    return res.status(404).send('Template not found');
  }
  res.setHeader('Content-Type', 'text/html');
  fs.createReadStream(filePath).pipe(res);
});

module.exports = router;
