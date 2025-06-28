const express = require('express');
const router = express.Router();
const clientController = require('../controllers/clientController');
const auth = require('../middleware/auth');

router.post('/import', auth, clientController.importClients);

module.exports = router;