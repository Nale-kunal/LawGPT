import express from 'express';
import Alert from '../models/Alert.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();
router.use(requireAuth);

router.get('/', async (req, res) => {
  const items = await Alert.find({ owner: req.user.userId }).sort({ createdAt: -1 });
  res.json(items);
});

router.post('/', async (req, res) => {
  const data = { ...req.body, owner: req.user.userId };
  const item = await Alert.create(data);
  res.status(201).json(item);
});

router.put('/:id/read', async (req, res) => {
  // Validate that the ID is provided and is a valid ObjectId
  if (!req.params.id || req.params.id === 'undefined' || req.params.id === 'null') {
    return res.status(400).json({ error: 'Invalid alert ID provided' });
  }
  
  try {
    const item = await Alert.findOneAndUpdate({ _id: req.params.id, owner: req.user.userId }, { isRead: true }, { new: true });
    if (!item) return res.status(404).json({ error: 'Not found' });
    res.json(item);
  } catch (error) {
    console.error('Error marking alert as read:', error);
    res.status(400).json({ error: 'Invalid alert ID format' });
  }
});

router.patch('/mark-all-read', async (req, res) => {
  await Alert.updateMany({ owner: req.user.userId, isRead: false }, { isRead: true });
  const items = await Alert.find({ owner: req.user.userId }).sort({ createdAt: -1 });
  res.json(items);
});

router.delete('/:id', async (req, res) => {
  // Validate that the ID is provided and is a valid ObjectId
  if (!req.params.id || req.params.id === 'undefined' || req.params.id === 'null') {
    return res.status(400).json({ error: 'Invalid alert ID provided' });
  }
  
  try {
    const result = await Alert.deleteOne({ _id: req.params.id, owner: req.user.userId });
    if (result.deletedCount === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ ok: true });
  } catch (error) {
    console.error('Error deleting alert:', error);
    res.status(400).json({ error: 'Invalid alert ID format' });
  }
});

export default router;



