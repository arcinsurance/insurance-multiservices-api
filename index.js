
const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const axios = require("axios");
const cors = require("cors");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 10000;

app.use(cors());
app.use(express.json());

const upload = multer({ dest: "uploads/" });

app.post("/api/send-signature-request", upload.single("pdf"), async (req, res) => {
    try {
        const pdfPath = req.file.path;
        const recipientEmail = req.body.recipientEmail;
        const documentTitle = req.body.documentTitle || "Documento";

        const fileData = fs.readFileSync(pdfPath);
        const base64PDF = fileData.toString("base64");

        const payload = {
            name: documentTitle,
            url: `data:application/pdf;base64,${base64PDF}`,
            annotations: [
                {
                    x: 100,
                    y: 100,
                    pages: "1",
                    type: "signature",
                    width: 200,
                    height: 50
                }
            ],
            async: false
        };

        const response = await axios.post(
            "https://api.pdf.co/v1/pdf/sign/add",
            payload,
            {
                headers: {
                    "x-api-key": process.env.PDFCO_API_KEY,
                    "Content-Type": "application/json"
                }
            }
        );

        // Eliminar archivo temporal
        fs.unlinkSync(pdfPath);

        console.log("Respuesta PDF.co:", response.data);
        res.json(response.data);

    } catch (error) {
        console.error("❌ Error al enviar a PDF.co:", error.response?.data || error.message);
        res.status(500).json({ error: true, message: error.response?.data || error.message });
    }
});

app.listen(port, () => {
    console.log(`🚀 Backend escuchando en el puerto ${port}`);
});
