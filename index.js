
const express = require('express');
const multer = require('multer');
const FormData = require('form-data');
const axios = require('axios');
const fs = require('fs');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
const upload = multer({ dest: 'uploads/' });

app.post('/api/send-signature-request', upload.single('pdf'), async (req, res) => {
    const file = req.file;
    const recipientEmail = req.body.recipientEmail;
    const form = new FormData();

    form.append('file', fs.createReadStream(file.path));
    form.append('title', 'Formulario de Consentimiento del Consumidor');
    form.append('subject', 'Por favor, firme este documento');
    form.append('message', 'Este documento requiere su firma digital.');
    form.append('signers[0][email_address]', recipientEmail);
    form.append('signers[0][name]', 'Cliente');
    form.append('signers[0][role]', 'signer');
    form.append('test_mode', '1');

    try {
        const response = await axios.post(
            'https://api.hellosign.com/v3/signature_request/send',
            form,
            {
                headers: {
                    ...form.getHeaders(),
                    Authorization: `Basic ${Buffer.from(process.env.HELLOSIGN_API_KEY + ":").toString("base64")}`,
                },
            }
        );
        res.json({ message: "Signature request sent", data: response.data });
    } catch (err) {
        res.status(500).json({ message: "HelloSign server error", error: err.response?.data || err.message });
    }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
