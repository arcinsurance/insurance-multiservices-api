const express = require('express');
const router = express.Router();
const registerAgent = require('../controllers/registerAgent');

router.post('/', registerAgent);

module.exports = router;
