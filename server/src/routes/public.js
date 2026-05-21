import { Router } from 'express';
import { getDb } from '../db.js';

const router = Router();

// GET /api/public/settings — returns only payment_qrcode (no auth required)
router.get('/settings', (req, res) => {
  const db = getDb();
  const row = db.prepare("SELECT value FROM settings WHERE key = 'payment_qrcode'").get();
  res.json({ payment_qrcode: row ? row.value : '' });
});

// GET /api/public/orders?phone=xxx — customer order lookup (no auth)
router.get('/orders', (req, res) => {
  const db = getDb();
  const { phone } = req.query;
  if (!phone) return res.status(400).json({ error: '请输入手机号' });
  const orders = db.prepare(
    'SELECT * FROM orders WHERE customer_phone = ? ORDER BY created_at DESC'
  ).all(phone);
  res.json(orders.map(o => ({ ...o, items: JSON.parse(o.items) })));
});

export default router;
