import express from 'express';
import Invoice from '../models/Invoice.js';
import Client from '../models/Client.js';
import { requireAuth } from '../middleware/auth.js';
import { sendInvoiceEmail } from '../utils/mailer.js';

const router = express.Router();
router.use(requireAuth);

router.get('/', async (req, res) => {
  const items = await Invoice.find({ owner: req.user.userId }).sort({ createdAt: -1 });
  res.json(items);
});

router.get('/:id', async (req, res) => {
  const item = await Invoice.findOne({ _id: req.params.id, owner: req.user.userId });
  if (!item) return res.status(404).json({ error: 'Not found' });
  res.json(item);
});

router.post('/', async (req, res) => {
  const data = { ...req.body, owner: req.user.userId };
  const created = await Invoice.create(data);
  res.status(201).json(created);
});

router.put('/:id', async (req, res) => {
  const updated = await Invoice.findOneAndUpdate(
    { _id: req.params.id, owner: req.user.userId },
    req.body,
    { new: true }
  );
  if (!updated) return res.status(404).json({ error: 'Not found' });
  res.json(updated);
});

router.delete('/:id', async (req, res) => {
  const result = await Invoice.deleteOne({ _id: req.params.id, owner: req.user.userId });
  if (result.deletedCount === 0) return res.status(404).json({ error: 'Not found' });
  res.json({ ok: true });
});

router.post('/:id/send', async (req, res) => {
  const { to, subject, message } = req.body;
  const invoice = await Invoice.findOne({ _id: req.params.id, owner: req.user.userId });
  if (!invoice) return res.status(404).json({ error: 'Not found' });

  let recipient = to;
  if (!recipient) {
    const client = await Client.findOne({ _id: invoice.clientId, owner: req.user.userId });
    if (!client) return res.status(400).json({ error: 'Client not found for invoice' });
    recipient = client.email;
  }

  try {
    const result = await sendInvoiceEmail({
      to: recipient,
      subject: subject || `Invoice ${invoice.invoiceNumber}`,
      message: message || 'Please find your invoice details below.',
      invoice,
    });
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;


