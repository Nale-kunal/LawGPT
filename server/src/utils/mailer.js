import nodemailer from 'nodemailer';

let cachedTransport = null;
let cachedIsEthereal = false;

async function getTransport() {
  if (cachedTransport) return cachedTransport;
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    // Fallback: create an Ethereal test account in dev
    if (process.env.NODE_ENV !== 'production') {
      const testAccount = await nodemailer.createTestAccount();
      cachedTransport = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
      cachedIsEthereal = true;
      return cachedTransport;
    }
    // No transport in production if not configured
    return null;
  }

  cachedTransport = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
  return cachedTransport;
}

export async function sendPasswordResetEmail({ to, resetUrl }) {
  const transport = await getTransport();
  if (!transport) throw new Error('SMTP transport not configured');

  const from = process.env.MAIL_FROM || 'no-reply@legalpro.local';
  const info = await transport.sendMail({
    from,
    to,
    subject: 'Reset your LegalPro password',
    text: `Click the link to reset your password: ${resetUrl}`,
    html: `<p>Click the link to reset your password:</p><p><a href="${resetUrl}">${resetUrl}</a></p>`,
  });
  const previewUrl = cachedIsEthereal ? nodemailer.getTestMessageUrl(info) : undefined;
  return { info, previewUrl };
}


