const sendDocumentToSignature = async (req, res) => {
  try {
    const { clientName, clientEmail, documentUrl } = req.body;

    if (!clientName || !clientEmail || !documentUrl) {
      return res.status(400).json({
        success: false,
        message: 'Faltan datos requeridos: nombre, correo o documento',
      });
    }

    // Simulación de envío exitoso (reemplazar con integración real)
    const signatureLink = 'https://firma.test/document123';

    return res.status(200).json({
      success: true,
      message: 'Documento enviado correctamente para firma',
      data: {
        clientName,
        signatureLink,
      },
    });

  } catch (error) {
    console.error('Error al enviar documento a firma:', error);

    return res.status(500).json({
      success: false,
      message: 'Ocurrió un error al enviar el documento para firma',
      error: error.message,
    });
  }
};

module.exports = sendDocumentToSignature;
