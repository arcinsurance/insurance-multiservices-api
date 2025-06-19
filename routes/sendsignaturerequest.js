const express = require('express');
const router = express.Router();
const sendDocumentToSignature = require('../controllers/sendSignatureRequest');

router.post('/', sendDocumentToSignature);

module.exports = router;
