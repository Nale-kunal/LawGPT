import express from 'express';
import TimeEntry from '../models/TimeEntry.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();
router.use(requireAuth);

router.get('/', async (req, res) => {
  const items = await TimeEntry.find({ owner: req.user.userId }).sort({ createdAt: -1 });
  res.json(items);
});

router.post('/', async (req, res) => {
  const data = { ...req.body, owner: req.user.userId };
  const item = await TimeEntry.create(data);
  res.status(201).json(item);
});

router.delete('/:id', async (req, res) => {
  const result = await TimeEntry.deleteOne({ _id: req.params.id, owner: req.user.userId });
  if (result.deletedCount === 0) return res.status(404).json({ error: 'Not found' });
  res.json({ ok: true });
});

export default router;



