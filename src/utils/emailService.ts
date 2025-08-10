import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: Number(process.env.SMTP_PORT) === 465, // Usar SSL si el puerto es 465
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
});

export async function sendEmail(to: string, subject: string, text: string, html?: string) {
  await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to,
    subject,
    text,
    ...(html ? { html } : {}),
  });
}

// Enviar email de bienvenida al agente
export async function sendAgentWelcomeEmail(to: string, name: string, tempPassword: string) {
  const subject = 'Bienvenido a Insurance Multiservices';
  const text = `Hola ${name}, tu usuario ha sido creado. Tu contraseña temporal es: ${tempPassword}`;
  await sendEmail(to, subject, text);
}

// Enviar email de sistema (notificaciones generales)
export async function sendSystemMessageEmail(to: string, subject: string, text: string) {
  await sendEmail(to, subject, text);
}

// Enviar email a cliente (notificaciones personalizadas)
export async function sendClientMessageEmail(to: string, subject: string, text: string, senderName?: string) {
  const fullText = senderName ? `${text}\n\nAtentamente,\n${senderName}` : text;
  await sendEmail(to, subject, fullText);
}
