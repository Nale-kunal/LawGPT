import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { requireAuth } from '../middleware/auth.js';
import crypto from 'crypto';
import { sendPasswordResetEmail } from '../utils/mailer.js';

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, barNumber, firm } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ error: 'Email already registered' });
    const user = await User.create({
      name,
      email,
      role: role || 'lawyer',
      barNumber,
      firm,
      passwordHash: User.hashPassword(password || 'changeme'),
    });
    return res.status(201).json({ id: user._id });
  } catch (e) {
    return res.status(500).json({ error: 'Failed to register' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    const ok = await user.verifyPassword(password || '');
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ userId: user._id, email: user.email, role: user.role }, process.env.JWT_SECRET || 'dev_secret', { expiresIn: '7d' });
    res.cookie('token', token, { httpOnly: true, sameSite: 'lax', secure: false, maxAge: 7*24*3600*1000 });
    return res.json({
      token,
      user: {
        id: String(user._id),
        name: user.name,
        email: user.email,
        role: user.role,
        barNumber: user.barNumber,
        firm: user.firm,
      }
    });
  } catch (e) {
    return res.status(500).json({ error: 'Login failed' });
  }
});

router.post('/logout', (req, res) => {
  res.clearCookie('token');
  return res.json({ ok: true });
});

// Request password reset: generates token and stores on user with 1h expiry
router.post('/forgot', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      // Do not reveal existence; respond OK
      return res.json({ ok: true });
    }
    const token = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = token;
    user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000);
    await user.save();

    // Attempt to send an email if SMTP is configured; do not fail the request if email send fails
    const appUrl = process.env.FRONTEND_URL || process.env.APP_URL || 'http://localhost:8080';
    const resetUrl = `${appUrl}/reset-password?token=${token}`;
    try {
      const result = await sendPasswordResetEmail({ to: email, resetUrl });
      if (result?.previewUrl) {
        console.log('Password reset email preview URL:', result.previewUrl);
      }
    } catch (e) {
      // Silently ignore email errors in API response; log for server operators
      console.error('Failed to send password reset email:', e?.message || e);
    }

    // Return ok; include token in dev to ease testing
    const includeToken = (process.env.NODE_ENV !== 'production');
    return res.json({ ok: true, ...(includeToken ? { token } : {}) });
  } catch (e) {
    return res.status(500).json({ error: 'Failed to process request' });
  }
});

// Reset password with token
router.post('/reset', async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) {
      return res.status(400).json({ error: 'Invalid request' });
    }
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() },
    });
    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired token' });
    }
    user.passwordHash = User.hashPassword(password);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
    return res.json({ ok: true });
  } catch (e) {
    return res.status(500).json({ error: 'Failed to reset password' });
  }
});

router.get('/me', requireAuth, async (req, res) => {
  const user = await User.findById(req.user.userId);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });
  return res.json({
    user: {
      id: String(user._id),
      name: user.name,
      email: user.email,
      role: user.role,
      barNumber: user.barNumber,
      firm: user.firm,
    }
  });
});

export default router;


