
const express = require("express");
const multer = require("multer");
const nodemailer = require("nodemailer");
const cors = require("cors");
const fs = require("fs");
const axios = require("axios");
require("dotenv").config();

const app = express();
const upload = multer();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 10000;

// Ruta para enviar correos normales
app.post("/api/send-communication-email", upload.any(), async (req, res) => {
  const { senderEmail, recipientEmail, subject, message } = req.body;

  if (!senderEmail || !recipientEmail || !subject || !message) {
    return res.status(400).json({ error: "Faltan campos requeridos." });
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS,
    },
  });

  const mailOptions = {
    from: senderEmail,
    to: recipientEmail,
    subject,
    html: message,
    attachments: req.files?.map((file) => ({
      filename: file.originalname,
      content: file.buffer,
    })),
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: "Correo enviado correctamente." });
  } catch (err) {
    console.error("Error al enviar correo:", err);
    res.status(500).json({ error: "Error al enviar el correo." });
  }
});

// Ruta para enviar documentos a la firma con PDF.co
app.post("/api/send-signature-request", upload.single("pdf"), async (req, res) => {
  const { recipientEmail, documentTitle } = req.body;
  const apiKey = process.env.PDFCO_API_KEY;

  if (!recipientEmail || !documentTitle || !req.file) {
    return res.status(400).json({ error: "Faltan datos para enviar a firma." });
  }

  try {
    const pdfBuffer = req.file.buffer.toString("base64");

    const payload = {
      name: documentTitle,
      url: "", // Dejamos vacío porque vamos a pasar el contenido como file
      async: false,
      annotations: [
        {
          fieldName: "signature1",
          type: "signature", // Aceptado por PDF.co
          x: 100,
          y: 150,
          page: 0,
          width: 150,
          height: 50
        }
      ],
      profiles: "signature",
      async: false,
    };

    const response = await axios.post(
      "https://api.pdf.co/v1/pdf/edit/add",
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
        },
        params: {
          file: pdfBuffer
        }
      }
    );

    console.log("📨 Respuesta de PDF.co:", response.data);
    res.status(200).json({ message: "Documento enviado a firma.", data: response.data });
  } catch (err) {
    console.error("Error al enviar a PDF.co:", err.response?.data || err.message);
    res.status(500).json({ error: "Error al enviar a PDF.co", details: err.response?.data });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Backend escuchando en el puerto ${PORT}`);
});
