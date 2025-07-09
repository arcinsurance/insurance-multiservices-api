import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// ✅ Transporter: configuración SMTP
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '465'),
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// ✅ Función para enviar correos del sistema (mensajes entre usuarios)
export const sendSystemMessageEmail = async (
  recipientEmail: string,
  subject: string,
  content: string
) => {
  const mailOptions = {
    from: `"Insurance Multiservices" <${process.env.SMTP_USER}>`,
    to: recipientEmail,
    subject: `📬 Nuevo mensaje: ${subject}`,
    html: `
      <div style="font-family: Arial, sans-serif; color: #333;">
        <h2 style="color: #0055a5;">📩 Tienes un nuevo mensaje</h2>

        <p>Hola,</p>

        <p>Has recibido un nuevo mensaje a través del sistema de <strong>Insurance Multiservices</strong>:</p>

        <div style="border-left: 4px solid #0055a5; padding-left: 15px; margin: 20px 0; background-color: #f9f9f9;">
          <p style="margin: 0;"><strong>Asunto:</strong> ${subject}</p>
          <p style="margin-top: 10px;">${content.replace(/\n/g, '<br/>')}</p>
        </div>

        <p>Puedes acceder al sistema para más detalles:</p>

        <p>
          👉 <a href="https://crm.insurancemultiservices.com" style="color: #0055a5; text-decoration: none;" target="_blank">
          Ir al CRM</a>
        </p>

        <p style="margin-top: 30px;">Saludos,<br/><strong>Equipo de Insurance Multiservices</strong></p>
        <hr style="margin-top: 40px;" />
        <p style="font-size: 12px; color: #999;">Este mensaje fue generado automáticamente. Por favor, no respondas a este correo.</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`📧 Email enviado con éxito a ${recipientEmail} con asunto "${subject}"`);
  } catch (error) {
    console.error(`❌ Error al enviar correo a ${recipientEmail}:`, error);
    throw error;
  }
};
