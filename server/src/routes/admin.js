import { Router } from 'express';
import { getDb } from '../db.js';
import { requireAuth, createToken } from '../middleware.js';

const router = Router();

// POST /api/admin/login
router.post('/login', (req, res) => {
  const db = getDb();
  const { password } = req.body;

  const setting = db.prepare('SELECT value FROM settings WHERE key = ?').get('admin_password');
  if (!setting || setting.value !== password) {
    return res.status(401).json({ error: '密码错误' });
  }

  const token = createToken();
  res.json({ token });
});

// GET /api/admin/dashboard
router.get('/dashboard', requireAuth, (req, res) => {
  const db = getDb();
  const today = new Date().toISOString().slice(0, 10);

  const todayOrders = db.prepare(
    "SELECT COUNT(*) as count FROM orders WHERE date(created_at) = ?"
  ).get(today).count;

  const pendingOrders = db.prepare(
    "SELECT COUNT(*) as count FROM orders WHERE status = 'pending'"
  ).get().count;

  const todayRevenue = db.prepare(
    "SELECT COALESCE(SUM(total_amount), 0) as total FROM orders WHERE date(created_at) = ? AND status != 'cancelled'"
  ).get(today).total;

  const totalProducts = db.prepare(
    "SELECT COUNT(*) as count FROM products WHERE status != 'hidden'"
  ).get().count;

  res.json({ todayOrders, pendingOrders, todayRevenue, totalProducts });
});

// GET /api/admin/orders
router.get('/orders', requireAuth, (req, res) => {
  const db = getDb();
  const { status } = req.query;

  let sql = 'SELECT * FROM orders WHERE 1=1';
  const params = [];

  if (status) {
    sql += ' AND status = ?';
    params.push(status);
  }

  sql += ' ORDER BY created_at DESC';

  const orders = db.prepare(sql).all(...params);
  res.json(orders.map(o => ({ ...o, items: JSON.parse(o.items) })));
});

// PATCH /api/admin/orders/:id/status
router.patch('/orders/:id/status', requireAuth, (req, res) => {
  const db = getDb();
  const { status } = req.body;

  const validStatuses = ['pending', 'paid', 'shipped', 'completed', 'cancelled'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: '无效的状态' });
  }

  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id);
  if (!order) {
    return res.status(404).json({ error: '订单不存在' });
  }

  // If cancelling, restore stock
  if (status === 'cancelled' && order.status !== 'cancelled') {
    const items = JSON.parse(order.items);
    db.transaction(() => {
      for (const item of items) {
        db.prepare('UPDATE products SET stock = stock + ?, status = CASE WHEN stock + ? > 0 THEN \'active\' ELSE status END, updated_at = datetime(\'now\',\'localtime\') WHERE id = ?')
          .run(item.qty, item.qty, item.product_id);
      }
      db.prepare("UPDATE orders SET status = ?, updated_at = datetime('now','localtime') WHERE id = ?")
        .run(status, req.params.id);
    })();
  } else {
    db.prepare("UPDATE orders SET status = ?, updated_at = datetime('now','localtime') WHERE id = ?")
      .run(status, req.params.id);
  }

  res.json({ success: true });
});

// GET /api/admin/products
router.get('/products', requireAuth, (req, res) => {
  const db = getDb();
  const products = db.prepare('SELECT * FROM products ORDER BY created_at DESC').all();
  res.json(products.map(p => ({ ...p, images: JSON.parse(p.images) })));
});

// POST /api/admin/products
router.post('/products', requireAuth, (req, res) => {
  const db = getDb();
  const { name, description, price, original_price, images, stock, category, status } = req.body;

  if (!name || !price) {
    return res.status(400).json({ error: '商品名称和价格不能为空' });
  }

  const result = db.prepare(
    `INSERT INTO products (name, description, price, original_price, images, stock, category, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    name, description || '', price, original_price || null,
    JSON.stringify(images || []), stock || 0, category || '', status || 'active'
  );

  const product = db.prepare('SELECT * FROM products WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json({ ...product, images: JSON.parse(product.images) });
});

// PUT /api/admin/products/:id
router.put('/products/:id', requireAuth, (req, res) => {
  const db = getDb();
  const { name, description, price, original_price, images, stock, category, status } = req.body;

  const existing = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
  if (!existing) {
    return res.status(404).json({ error: '商品不存在' });
  }

  db.prepare(
    `UPDATE products SET name=?, description=?, price=?, original_price=?, images=?, stock=?, category=?, status=?, updated_at=datetime('now','localtime')
     WHERE id=?`
  ).run(
    name, description || '', price, original_price || null,
    JSON.stringify(images || []), stock, category || '', status || 'active',
    req.params.id
  );

  const product = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
  res.json({ ...product, images: JSON.parse(product.images) });
});

// DELETE /api/admin/products/:id
router.delete('/products/:id', requireAuth, (req, res) => {
  const db = getDb();
  const existing = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
  if (!existing) {
    return res.status(404).json({ error: '商品不存在' });
  }

  db.prepare('DELETE FROM products WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// PATCH /api/admin/products/:id/status
router.patch('/products/:id/status', requireAuth, (req, res) => {
  const db = getDb();
  const { status } = req.body;

  const existing = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
  if (!existing) {
    return res.status(404).json({ error: '商品不存在' });
  }

  db.prepare("UPDATE products SET status=?, updated_at=datetime('now','localtime') WHERE id=?")
    .run(status, req.params.id);

  res.json({ success: true });
});

// GET /api/admin/settings
router.get('/settings', requireAuth, (req, res) => {
  const db = getDb();
  const settings = db.prepare('SELECT * FROM settings').all();
  const result = {};
  for (const s of settings) {
    result[s.key] = s.value;
  }
  res.json(result);
});

// PUT /api/admin/settings
router.put('/settings', requireAuth, (req, res) => {
  const db = getDb();
  const { payment_qrcode, admin_password } = req.body;

  const update = db.transaction(() => {
    if (payment_qrcode !== undefined) {
      db.prepare('UPDATE settings SET value = ? WHERE key = ?').run(payment_qrcode, 'payment_qrcode');
    }
    if (admin_password !== undefined) {
      db.prepare('UPDATE settings SET value = ? WHERE key = ?').run(admin_password, 'admin_password');
    }
  });
  update();

  res.json({ success: true });
});

export default router;
