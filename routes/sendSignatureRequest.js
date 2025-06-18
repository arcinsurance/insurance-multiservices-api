import axios from 'axios';

const sendSignatureRequest = async (req, res) => {
  try {
    const file = req.file;
    const recipientEmail = req.body.recipientEmail;
    const documentTitle = req.body.documentTitle;

    if (!file || !recipientEmail || !documentTitle) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const base64PDF = file.buffer.toString('base64');

    const payload = {
      name: documentTitle,
      async: false,
      file: base64PDF,
      annotations: [
        {
          x: 400,
          y: 100,
          text: "Firma aquí",
          type: "signature",
          pages: "1",
          recipientname: "Cliente",
          recipientemail: recipientEmail,
          role: "signer"
        }
      ]
    };

    const pdfcoResponse = await axios.post(
      'https://api.pdf.co/v1/pdf/sign/add',
      payload,
      {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.PDFCO_API_KEY
        }
      }
    );

    res.json({ success: true, response: pdfcoResponse.data });
  } catch (error) {
    console.error("Error sending to PDF.co:", error?.response?.data || error.message);
    res.status(500).json({ error: 'Error sending document to PDF.co' });
  }
};

export default sendSignatureRequest;
