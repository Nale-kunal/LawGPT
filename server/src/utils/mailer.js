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


export async function sendInvoiceEmail({ to, subject, message, invoice }) {
  const transport = await getTransport();
  if (!transport) throw new Error('SMTP transport not configured');

  const from = process.env.MAIL_FROM || 'no-reply@legalpro.local';
  const html = `
    <div style="font-family: Arial, sans-serif;">
      <h2>${subject || 'Invoice'}</h2>
      <p>${message || ''}</p>
      <table cellpadding="6" cellspacing="0" border="0" style="border-collapse: collapse; width: 100%;">
        <tr>
          <td><strong>Invoice #</strong></td><td>${invoice.invoiceNumber}</td>
        </tr>
        <tr>
          <td><strong>Issue Date</strong></td><td>${new Date(invoice.issueDate).toLocaleDateString()}</td>
        </tr>
        <tr>
          <td><strong>Due Date</strong></td><td>${new Date(invoice.dueDate).toLocaleDateString()}</td>
        </tr>
        <tr>
          <td><strong>Status</strong></td><td>${invoice.status}</td>
        </tr>
      </table>
      <h3>Items</h3>
      <table cellpadding="6" cellspacing="0" border="1" style="border-collapse: collapse; width: 100%;">
        <thead>
          <tr>
            <th align="left">Description</th>
            <th align="right">Qty</th>
            <th align="right">Unit Price</th>
            <th align="right">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${(invoice.items || []).map(i => `
            <tr>
              <td>${i.description}</td>
              <td align="right">${i.quantity}</td>
              <td align="right">${i.unitPrice.toFixed(2)}</td>
              <td align="right">${i.amount.toFixed(2)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      <p style="text-align:right;">
        Subtotal: <strong>${invoice.subtotal.toFixed(2)}</strong><br/>
        Tax (${invoice.taxRate}%): <strong>${invoice.taxAmount.toFixed(2)}</strong><br/>
        Discount: <strong>${invoice.discountAmount.toFixed(2)}</strong><br/>
        Total: <strong>${invoice.total.toFixed(2)}</strong>
      </p>
      ${invoice.notes ? `<p><strong>Notes:</strong> ${invoice.notes}</p>` : ''}
      ${invoice.terms ? `<p><strong>Terms:</strong> ${invoice.terms}</p>` : ''}
    </div>
  `;

  const info = await transport.sendMail({
    from,
    to,
    subject: subject || `Invoice ${invoice.invoiceNumber}`,
    text: `Invoice ${invoice.invoiceNumber} - Total ${invoice.total}`,
    html,
  });
  const previewUrl = cachedIsEthereal ? nodemailer.getTestMessageUrl(info) : undefined;
  return { ok: true, previewUrl };
}


