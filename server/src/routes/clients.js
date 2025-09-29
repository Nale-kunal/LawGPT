import express from 'express';
import Client from '../models/Client.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.use(requireAuth);

router.get('/', async (req, res) => {
  const clients = await Client.find({ owner: req.user.userId }).sort({ createdAt: -1 });
  res.json(clients);
});

router.post('/', async (req, res) => {
  const data = { ...req.body, owner: req.user.userId };
  const client = await Client.create(data);
  res.status(201).json(client);
});

router.put('/:id', async (req, res) => {
  const client = await Client.findOneAndUpdate({ _id: req.params.id, owner: req.user.userId }, req.body, { new: true });
  if (!client) return res.status(404).json({ error: 'Not found' });
  res.json(client);
});

router.delete('/:id', async (req, res) => {
  const result = await Client.deleteOne({ _id: req.params.id, owner: req.user.userId });
  if (result.deletedCount === 0) return res.status(404).json({ error: 'Not found' });
  res.json({ ok: true });
});

export default router;



