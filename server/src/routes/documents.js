import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { requireAuth } from '../middleware/auth.js';
import Folder from '../models/Folder.js';
import Document from '../models/Document.js';

const router = express.Router();

// Ensure uploads directory exists
const uploadsDir = path.join(process.cwd(), 'server', 'uploads');
fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9-_\.]/g, '_');
    cb(null, `${base}-${uniqueSuffix}${ext}`);
  }
});

const upload = multer({ storage });

// Folders CRUD
router.get('/folders', async (req, res) => {
  const ownerId = req.user?.userId;
  const criteria = ownerId ? { ownerId } : {};
  const folders = await Folder.find(criteria).sort({ createdAt: -1 });
  res.json({ folders });
});

router.post('/folders', async (req, res) => {
  const { name, parentId } = req.body;
  const folder = await Folder.create({ name, parentId: parentId || undefined, ownerId: req.user?.userId });
  res.status(201).json({ folder });
});

router.put('/folders/:id', async (req, res) => {
  const { name } = req.body;
  const match = req.user?.userId ? { _id: req.params.id, ownerId: req.user.userId } : { _id: req.params.id };
  const folder = await Folder.findOneAndUpdate(match, { name }, { new: true });
  if (!folder) return res.status(404).json({ error: 'Folder not found' });
  res.json({ folder });
});

router.delete('/folders/:id', async (req, res) => {
  const folderId = req.params.id;
  const match = req.user?.userId ? { _id: folderId, ownerId: req.user.userId } : { _id: folderId };
  const folder = await Folder.findOne(match);
  if (!folder) return res.status(404).json({ error: 'Folder not found' });
  // Delete documents in the folder
  const docMatch = req.user?.userId ? { folderId, ownerId: req.user.userId } : { folderId };
  const docs = await Document.find(docMatch);
  for (const doc of docs) {
    try { fs.unlinkSync(path.join(uploadsDir, path.basename(doc.url))); } catch {}
    await doc.deleteOne();
  }
  await folder.deleteOne();
  res.json({ ok: true });
});

// Documents CRUD
router.get('/files', async (req, res) => {
  const { folderId } = req.query;
  const criteria = req.user?.userId ? { ownerId: req.user.userId } : {};
  if (folderId) criteria.folderId = folderId;
  const files = await Document.find(criteria).sort({ createdAt: -1 });
  res.json({ files });
});

router.post('/upload', upload.array('files'), async (req, res) => {
  const { folderId } = req.body;
  const saved = [];
  for (const file of req.files || []) {
    const url = `/uploads/${file.filename}`;
    const doc = await Document.create({
      name: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      url,
      folderId: folderId || undefined,
      ownerId: req.user?.userId,
    });
    saved.push(doc);
  }
  res.status(201).json({ files: saved });
});

router.put('/files/:id', async (req, res) => {
  const { name, tags, folderId } = req.body;
  const match = req.user?.userId ? { _id: req.params.id, ownerId: req.user.userId } : { _id: req.params.id };
  const doc = await Document.findOneAndUpdate(
    match,
    { name, tags, folderId },
    { new: true }
  );
  if (!doc) return res.status(404).json({ error: 'File not found' });
  res.json({ file: doc });
});

router.delete('/files/:id', async (req, res) => {
  const match = req.user?.userId ? { _id: req.params.id, ownerId: req.user.userId } : { _id: req.params.id };
  const doc = await Document.findOne(match);
  if (!doc) return res.status(404).json({ error: 'File not found' });
  try { fs.unlinkSync(path.join(uploadsDir, path.basename(doc.url))); } catch {}
  await doc.deleteOne();
  res.json({ ok: true });
});

export default router;


