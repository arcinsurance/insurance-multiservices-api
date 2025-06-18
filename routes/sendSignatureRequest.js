
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

export default async function sendSignatureRequest(req, res) {
  try {
    const pdfBuffer = req.file.buffer;
    const base64File = pdfBuffer.toString('base64');
    const { recipientEmail, documentTitle } = req.body;

    if (!recipientEmail || !documentTitle || !base64File) {
      return res.status(400).json({ success: false, error: "Faltan datos requeridos." });
    }

    const annotations = [
      {
        text: "Firme aquí",
        x: 50,
        y: 700,
        pages: "1",
        type: "signature",
        width: 150,
        height: 40
      }
    ];

    const payload = {
      name: documentTitle,
      async: false,
      file: base64File,
      inline: true,
      annotations: annotations,
      profiles: ["signature"],
      encrypt: false,
      expiresIn: 72
    };

    const pdfcoResponse = await axios.post(
      'https://api.pdf.co/v1/pdf/sign/add',
      payload,
      {
        headers: {
          'x-api-key': process.env.PDFCO_API_KEY,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log("✅ Respuesta de PDF.co:", pdfcoResponse.data);
    res.status(200).json({ success: true, data: pdfcoResponse.data });
  } catch (error) {
    console.error("❌ Error PDF.co:", error.response?.data || error.message);
    res.status(500).json({ success: false, error: "Error al enviar documento a PDF.co" });
  }
}
