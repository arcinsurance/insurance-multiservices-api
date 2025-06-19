
const nodemailer = require('nodemailer');

const otpStore = {};

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function sendEmailWithOtp(to, otp) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_SENDER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  await transporter.sendMail({
    from: \`"Insurance Multiservices" <\${process.env.EMAIL_SENDER}>\`,
    to,
    subject: 'Tu código de seguridad',
    text: \`Tu código OTP es: \${otp}\`,
  });
}

module.exports = { generateOtp, sendEmailWithOtp, otpStore };
