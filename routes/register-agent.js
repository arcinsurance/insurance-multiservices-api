const express = require('express');
const router = express.Router();
const registerAgent = require('../controllers/registerAgent');

router.post('/register-agent', registerAgent);

module.exports = router;
