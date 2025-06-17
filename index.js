const express = require("express");
const multer = require("multer");
const cors = require("cors");
const axios = require("axios");
const FormData = require("form-data");

const upload = multer();
const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post("/api/send-signature-request", upload.single("pdf"), async (req, res) => {
  try {
    const { recipientEmail, documentTitle } = req.body;
    const pdfBuffer = req.file?.buffer;

    console.log("📨 Iniciando envío a firma...");
    console.log("👉 Correo destinatario:", recipientEmail);
    console.log("📄 Título del documento:", documentTitle);

    if (!recipientEmail || !pdfBuffer || !documentTitle) {
      console.error("❌ Datos faltantes (email, pdf o título)");
      return res.status(400).json({ error: "Faltan datos necesarios: PDF, email o título." });
    }

    const formData = new FormData();
    formData.append("file", pdfBuffer, {
      filename: "documento.pdf",
      contentType: "application/pdf"
    });
    formData.append("title", documentTitle);
    formData.append("subject", "Firma electrónica requerida");
    formData.append("message", "Por favor firme este documento.");
    formData.append("signers[0][email_address]", recipientEmail);
    formData.append("signers[0][name]", "Cliente");

    const response = await axios.post(
      "https://api.hellosign.com/v3/signature_request/send",
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          Authorization: "Basic " + Buffer.from(process.env.DROPBOXSIGN_API_KEY + ":").toString("base64")
        }
      }
    );

    console.log("✅ Firma enviada exitosamente:", response.data);
    res.status(200).json({ success: true, data: response.data });

  } catch (error) {
    console.error("🚨 Error al enviar a HelloSign:", error.response?.data || error.message);
    res.status(500).json({ error: error.response?.data || error.message });
  }
});

app.listen(PORT, () => {
  console.log("🚀 Backend escuchando en el puerto", PORT);
});