
import express from "express";
import multer from "multer";
import cors from "cors";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import axios from "axios";
import fs from "fs";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

const upload = multer({ storage: multer.memoryStorage() });

app.use(cors());
app.use(express.json());

app.post("/api/send-communication-email", upload.array("attachments"), async (req, res) => {
  const { senderEmail, recipientEmail, subject, message } = req.body;
  const attachments = req.files.map((file) => ({
    filename: file.originalname,
    content: file.buffer,
  }));

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
    text: message,
    attachments,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).send("Email sent successfully");
  } catch (error) {
    res.status(500).send(`Failed to send emails: ${error}`);
  }
});

app.post("/api/send-signature-request", upload.single("pdf"), async (req, res) => {
  try {
    const fileBase64 = req.file.buffer.toString("base64");
    const { recipientEmail, documentTitle } = req.body;

    const response = await axios.post("https://api.pdf.co/v1/pdf/sign/add", {
      name: documentTitle,
      async: false,
      file: fileBase64,
      annotations: [
        {
          x: 400,
          y: 100,
          text: "Firma aquí",
          type: "signature",
          pages: "1",
          recipientname: "Cliente",
          recipientemail: recipientEmail,
          role: "signer",
        },
      ],
    }, {
      headers: {
        "x-api-key": process.env.PDFCO_API_KEY,
        "Content-Type": "application/json",
      },
    });

    res.status(200).json(response.data);
  } catch (error) {
    console.error("Error enviando a PDF.co:", error.message);
    res.status(500).json({ error: "Error enviando a PDF.co", message: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
