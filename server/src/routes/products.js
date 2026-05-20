import { Router } from 'express';
import { getDb } from '../db.js';

const router = Router();

// GET /api/products - 商品列表
router.get('/', (req, res) => {
  const db = getDb();
  const { category, status } = req.query;

  let sql = 'SELECT * FROM products WHERE 1=1';
  const params = [];

  if (category) {
    sql += ' AND category = ?';
    params.push(category);
  }

  if (status) {
    sql += ' AND status = ?';
    params.push(status);
  } else {
    // Default: only show active products to customers
    sql += ' AND status = ?';
    params.push('active');
  }

  sql += ' ORDER BY created_at DESC';

  const products = db.prepare(sql).all(...params);
  res.json(products.map(p => ({ ...p, images: JSON.parse(p.images) })));
});

// GET /api/products/:id - 商品详情
router.get('/:id', (req, res) => {
  const db = getDb();
  const product = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);

  if (!product) {
    return res.status(404).json({ error: '商品不存在' });
  }

  res.json({ ...product, images: JSON.parse(product.images) });
});

export default router;
