import { Router } from 'express';
import { getDb } from '../db.js';

const router = Router();

// POST /api/orders - 提交订单
router.post('/', (req, res) => {
  const db = getDb();
  const { customer_name, customer_phone, items, note } = req.body;

  if (!customer_name || !customer_phone || !items || !items.length) {
    return res.status(400).json({ error: '请填写完整信息' });
  }

  // Validate stock and calculate total
  let total_amount = 0;
  const stockCheck = db.transaction(() => {
    for (const item of items) {
      const product = db.prepare('SELECT * FROM products WHERE id = ?').get(item.product_id);
      if (!product) {
        throw new Error(`商品 "${item.name}" 不存在`);
      }
      if (product.status !== 'active') {
        throw new Error(`商品 "${product.name}" 已下架`);
      }
      if (product.stock < item.qty) {
        throw new Error(`商品 "${product.name}" 库存不足，当前库存 ${product.stock}`);
      }
      total_amount += product.price * item.qty;
      item.name = product.name;
      item.price = product.price;
    }
  });

  try {
    stockCheck();
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }

  // Create order and deduct stock in a transaction
  const createOrder = db.transaction(() => {
    const result = db.prepare(
      'INSERT INTO orders (customer_name, customer_phone, items, total_amount, note) VALUES (?, ?, ?, ?, ?)'
    ).run(customer_name, customer_phone, JSON.stringify(items), total_amount, note || '');

    // Deduct stock
    for (const item of items) {
      db.prepare('UPDATE products SET stock = stock - ?, updated_at = datetime(\'now\',\'localtime\') WHERE id = ?')
        .run(item.qty, item.product_id);

      // Auto-mark as sold_out if stock reaches 0
      db.prepare('UPDATE products SET status = \'sold_out\', updated_at = datetime(\'now\',\'localtime\') WHERE id = ? AND stock <= 0')
        .run(item.product_id);
    }

    return result;
  });

  const result = createOrder();

  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json({ ...order, items: JSON.parse(order.items) });
});

export default router;
