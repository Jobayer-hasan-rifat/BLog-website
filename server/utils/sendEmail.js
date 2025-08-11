const nodemailer = require('nodemailer');

async function createTransport() {
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587,
      secure: false,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
    });
  }

  const testAccount = await nodemailer.createTestAccount();
  return nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: { user: testAccount.user, pass: testAccount.pass }
  });
}

module.exports = async function sendEmail({ to, subject, text, html }) {
  const transporter = await createTransport();
  const info = await transporter.sendMail({
    from: 'MiniBlog <no-reply@miniblog.local>',
    to,
    subject,
    text,
    html
  });
  if (nodemailer.getTestMessageUrl(info)) {
    console.log('Preview URL: ' + nodemailer.getTestMessageUrl(info));
  }
  return info;
};


