require('dotenv').config();
const express = require('express');
const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');
const cors = require('cors');
const app = express();
const upload = multer({ storage: multer.memoryStorage() });

app.use(cors());
app.use(express.json());

app.post('/api/send-signature-request', upload.single('pdf'), async (req, res) => {
    try {
        const { recipientEmail } = req.body;
        const pdfFile = req.file;

        if (!pdfFile) {
            return res.status(400).json({ error: "No PDF file received" });
        }

        const formData = new FormData();
        formData.append("file", pdfFile.buffer, {
            filename: "consentimiento.pdf",
            contentType: "application/pdf"
        });
        formData.append("title", "Formulario de Consentimiento del Consumidor");
        formData.append("signers[0][email_address]", recipientEmail);
        formData.append("signers[0][name]", "Cliente");
        formData.append("signers[0][role]", "Cliente");
        formData.append("test_mode", "1");

        const response = await axios.post("https://api.hellosign.com/v3/signature_request/send", formData, {
            headers: {
                ...formData.getHeaders(),
                Authorization: `Basic ${Buffer.from(process.env.HELLOSIGN_API_KEY + ":").toString("base64")}`
            }
        });

        res.json({ message: "Signature request sent", data: response.data });

    } catch (error) {
        console.error("HelloSign Error:", error.response?.data || error.message);
        res.status(500).json({ error: "Failed to send to HelloSign" });
    }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));