import express from 'express';
import Case from '../models/Case.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.use(requireAuth);

router.get('/', async (req, res) => {
  const items = await Case.find({ owner: req.user.userId }).sort({ createdAt: -1 });
  res.json(items);
});

router.post('/', async (req, res) => {
  const data = { ...req.body, owner: req.user.userId };
  const item = await Case.create(data);
  res.status(201).json(item);
});

router.get('/:id', async (req, res) => {
  const item = await Case.findOne({ _id: req.params.id, owner: req.user.userId });
  if (!item) return res.status(404).json({ error: 'Not found' });
  res.json(item);
});

router.put('/:id', async (req, res) => {
  const item = await Case.findOneAndUpdate({ _id: req.params.id, owner: req.user.userId }, req.body, { new: true });
  if (!item) return res.status(404).json({ error: 'Not found' });
  res.json(item);
});

router.delete('/:id', async (req, res) => {
  const result = await Case.deleteOne({ _id: req.params.id, owner: req.user.userId });
  if (result.deletedCount === 0) return res.status(404).json({ error: 'Not found' });
  res.json({ ok: true });
});

export default router;



