# 甩卖尾货化妆品商城 - 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 构建一个面向微信生态的 H5 移动商城，支持商品浏览、购物车、下单（免注册），以及带密码保护的管理后台。

**Architecture:** React + Vite 前端（含客户商城和管理后台两个区域），Express + SQLite 后端，前后端分离部署。客户和管理后台共享同一前端项目，通过路由区分。

**Tech Stack:** React 18, Vite, Tailwind CSS, React Router v6, Express, better-sqlite3

---

### Task 1: 项目脚手架搭建

**Files:**
- Create: `client/package.json`, `client/vite.config.js`, `client/tailwind.config.js`, `client/postcss.config.js`, `client/index.html`, `client/src/main.jsx`, `client/src/App.jsx`, `client/src/index.css`
- Create: `server/package.json`, `server/src/index.js`

- [ ] **Step 1: 创建 client 项目**

```bash
cd d:/claude-project && mkdir -p client/src server/src
```

- [ ] **Step 2: 编写 client/package.json**

```json
{
  "name": "cosmetics-store-client",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.26.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.3.1",
    "autoprefixer": "^10.4.19",
    "postcss": "^8.4.40",
    "tailwindcss": "^3.4.7",
    "vite": "^5.4.0"
  }
}
```

- [ ] **Step 3: 编写 client/vite.config.js**

```js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:3001',
    },
  },
});
```

- [ ] **Step 4: 编写 client/tailwind.config.js**

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {},
  },
  plugins: [],
};
```

- [ ] **Step 5: 编写 client/postcss.config.js**

```js
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

- [ ] **Step 6: 编写 client/index.html**

```html
<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
    <title>尾货化妆品甩卖</title>
  </head>
  <body class="bg-gray-50">
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

- [ ] **Step 7: 编写 client/src/index.css**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

- [ ] **Step 8: 编写 client/src/main.jsx**

```jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
```

- [ ] **Step 9: 编写 client/src/App.jsx**

```jsx
import { Routes, Route } from 'react-router-dom';

export default function App() {
  return (
    <div className="min-h-screen">
      <Routes>
        <Route path="/" element={<div className="p-4 text-center text-gray-500 mt-20">商城加载中...</div>} />
      </Routes>
    </div>
  );
}
```

- [ ] **Step 10: 编写 server/package.json**

```json
{
  "name": "cosmetics-store-server",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "start": "node src/index.js",
    "dev": "node --watch src/index.js"
  },
  "dependencies": {
    "better-sqlite3": "^11.1.2",
    "cors": "^2.8.5",
    "express": "^4.19.2",
    "uuid": "^10.0.0"
  }
}
```

- [ ] **Step 11: 编写 server/src/index.js**

```js
import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ ok: true });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

- [ ] **Step 12: 安装依赖**

```bash
cd d:/claude-project/client && npm install
cd d:/claude-project/server && npm install
```

- [ ] **Step 13: 验证脚手架**

```bash
cd d:/claude-project/server && node src/index.js
# Expected: "Server running on port 3001"
# Ctrl+C to stop

cd d:/claude-project/client && npx vite build
# Expected: Build succeeds with no errors
```

- [ ] **Step 14: Commit**

```bash
cd d:/claude-project && git init && git add -A && git commit -m "feat: scaffold project with React+Vite client and Express server"
```

---

### Task 2: 数据库初始化

**Files:**
- Create: `server/src/db.js`

- [ ] **Step 1: 编写 server/src/db.js**

```js
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = process.env.DB_PATH || path.join(__dirname, '..', 'data', 'store.db');

let db;

export function getDb() {
  if (!db) {
    const fs = await import('fs');
    const dir = path.dirname(DB_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    initTables(db);
  }
  return db;
}

function initTables(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT DEFAULT '',
      price REAL NOT NULL,
      original_price REAL,
      images TEXT DEFAULT '[]',
      stock INTEGER DEFAULT 0,
      category TEXT DEFAULT '',
      status TEXT DEFAULT 'active' CHECK(status IN ('active','sold_out','hidden')),
      created_at TEXT DEFAULT (datetime('now','localtime')),
      updated_at TEXT DEFAULT (datetime('now','localtime'))
    );

    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_name TEXT NOT NULL,
      customer_phone TEXT NOT NULL,
      items TEXT NOT NULL,
      total_amount REAL NOT NULL,
      status TEXT DEFAULT 'pending' CHECK(status IN ('pending','paid','shipped','completed','cancelled')),
      note TEXT DEFAULT '',
      created_at TEXT DEFAULT (datetime('now','localtime')),
      updated_at TEXT DEFAULT (datetime('now','localtime'))
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    INSERT OR IGNORE INTO settings (key, value) VALUES ('admin_password', 'admin123');
    INSERT OR IGNORE INTO settings (key, value) VALUES ('payment_qrcode', '');
  `);
}

export default getDb;
```

- [ ] **Step 2: 更新 server/src/index.js 引入数据库**

```js
import express from 'express';
import cors from 'cors';
import { getDb } from './db.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Initialize database on startup
getDb();

app.get('/api/health', (req, res) => {
  res.json({ ok: true });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

- [ ] **Step 3: 验证数据库初始化**

```bash
cd d:/claude-project/server && node -e "
const { getDb } = require('./src/db.js');
// ESM workaround: create a quick test
" 
```

Actually verify by starting the server:

```bash
cd d:/claude-project/server && node src/index.js
# Expected: Server running on port 3001, data/store.db created
# Ctrl+C to stop
ls d:/claude-project/server/data/
# Expected: store.db exists
```

- [ ] **Step 4: Commit**

```bash
cd d:/claude-project && git add server/src/db.js server/src/index.js && git commit -m "feat: add SQLite database initialization"
```

---

### Task 3: 商品 API（公开）

**Files:**
- Create: `server/src/routes/products.js`
- Modify: `server/src/index.js`

- [ ] **Step 1: 编写 server/src/routes/products.js**

```js
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
```

- [ ] **Step 2: 更新 server/src/index.js 挂载路由**

在 `app.use(express.json());` 之后添加：

```js
import productRoutes from './routes/products.js';
app.use('/api/products', productRoutes);
```

- [ ] **Step 3: 手动验证 API**

```bash
cd d:/claude-project/server && node src/index.js &
sleep 2

# 插入测试数据
sqlite3 data/store.db "INSERT INTO products (name, price, original_price, stock, category, images) VALUES ('测试口红', 29.9, 99.0, 50, '口红', '[]');"

# 测试列表接口
curl http://localhost:3001/api/products
# Expected: JSON array with the test product

# 测试详情接口
curl http://localhost:3001/api/products/1
# Expected: JSON object with test product details

kill %1
```

- [ ] **Step 4: Commit**

```bash
cd d:/claude-project && git add server/src/routes/products.js server/src/index.js && git commit -m "feat: add public products API"
```

---

### Task 4: 订单 API（公开）

**Files:**
- Create: `server/src/routes/orders.js`
- Modify: `server/src/index.js`

- [ ] **Step 1: 编写 server/src/routes/orders.js**

```js
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
```

- [ ] **Step 2: 更新 server/src/index.js 挂载路由**

在 product routes 之后添加：

```js
import orderRoutes from './routes/orders.js';
app.use('/api/orders', orderRoutes);
```

- [ ] **Step 3: 手动验证 API**

```bash
cd d:/claude-project/server && node src/index.js &
sleep 2

# 测试下单
curl -X POST http://localhost:3001/api/orders \
  -H "Content-Type: application/json" \
  -d '{"customer_name":"张三","customer_phone":"13800138000","items":[{"product_id":1,"qty":2}],"note":"尽快发货"}'

# Expected: 201, order JSON with id and calculated total

# 验证库存已扣减
curl http://localhost:3001/api/products/1
# Expected: stock should be reduced

kill %1
```

- [ ] **Step 4: Commit**

```bash
cd d:/claude-project && git add server/src/routes/orders.js server/src/index.js && git commit -m "feat: add order submission API with stock deduction"
```

---

### Task 5: 管理后台认证中间件

**Files:**
- Create: `server/src/middleware.js`

- [ ] **Step 1: 编写 server/src/middleware.js**

```js
import { getDb } from './db.js';

const tokens = new Map();

export function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: '请先登录' });
  }

  const token = authHeader.slice(7);
  if (!tokens.has(token)) {
    return res.status(401).json({ error: '登录已过期，请重新登录' });
  }

  next();
}

export function createToken() {
  const token = crypto.randomUUID();
  tokens.set(token, true);
  // Token expires after 24 hours
  setTimeout(() => tokens.delete(token), 24 * 60 * 60 * 1000);
  return token;
}
```

- [ ] **Step 2: Commit**

```bash
cd d:/claude-project && git add server/src/middleware.js && git commit -m "feat: add admin auth middleware with token support"
```

---

### Task 6: 管理后台 API

**Files:**
- Create: `server/src/routes/admin.js`
- Modify: `server/src/index.js`

- [ ] **Step 1: 编写 server/src/routes/admin.js**

```js
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
```

- [ ] **Step 2: 更新 server/src/index.js 挂载管理路由**

在 order routes 之后添加：

```js
import adminRoutes from './routes/admin.js';
app.use('/api/admin', adminRoutes);
```

- [ ] **Step 3: 修复 db.js 中的已知问题**

`server/src/db.js` 中使用了 top-level await (`const fs = await import('fs')`)，但项目是 ESM，需要用同步方式：

```js
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = process.env.DB_PATH || path.join(__dirname, '..', 'data', 'store.db');

let db;

export function getDb() {
  if (!db) {
    const dir = path.dirname(DB_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    initTables(db);
  }
  return db;
}

function initTables(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT DEFAULT '',
      price REAL NOT NULL,
      original_price REAL,
      images TEXT DEFAULT '[]',
      stock INTEGER DEFAULT 0,
      category TEXT DEFAULT '',
      status TEXT DEFAULT 'active' CHECK(status IN ('active','sold_out','hidden')),
      created_at TEXT DEFAULT (datetime('now','localtime')),
      updated_at TEXT DEFAULT (datetime('now','localtime'))
    );

    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_name TEXT NOT NULL,
      customer_phone TEXT NOT NULL,
      items TEXT NOT NULL,
      total_amount REAL NOT NULL,
      status TEXT DEFAULT 'pending' CHECK(status IN ('pending','paid','shipped','completed','cancelled')),
      note TEXT DEFAULT '',
      created_at TEXT DEFAULT (datetime('now','localtime')),
      updated_at TEXT DEFAULT (datetime('now','localtime'))
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    INSERT OR IGNORE INTO settings (key, value) VALUES ('admin_password', 'admin123');
    INSERT OR IGNORE INTO settings (key, value) VALUES ('payment_qrcode', '');
  `);
}

export default getDb;
```

- [ ] **Step 4: 手动验证管理 API**

```bash
cd d:/claude-project/server && node src/index.js &
sleep 2

# 测试登录
TOKEN=$(curl -s -X POST http://localhost:3001/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"password":"admin123"}' | grep -o '"token":"[^"]*' | cut -d'"' -f4)

# 测试 dashboard
curl http://localhost:3001/api/admin/dashboard -H "Authorization: Bearer $TOKEN"
# Expected: { todayOrders, pendingOrders, todayRevenue, totalProducts }

# 测试创建商品
curl -X POST http://localhost:3001/api/admin/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"name":"管理端测试商品","price":19.9,"stock":30}'
# Expected: 201, product JSON

kill %1
```

- [ ] **Step 5: Commit**

```bash
cd d:/claude-project && git add server/src/routes/admin.js server/src/db.js server/src/index.js && git commit -m "feat: add admin API (auth, dashboard, orders, products, settings)"
```

---

### Task 7: 前端基础设施 — API 工具和路由

**Files:**
- Create: `client/src/utils/api.js`
- Modify: `client/src/App.jsx`
- Create: `client/src/hooks/useCart.js`

- [ ] **Step 1: 编写 client/src/utils/api.js**

```js
const API_BASE = '/api';

async function request(path, options = {}) {
  const token = localStorage.getItem('admin_token');
  const headers = { 'Content-Type': 'application/json', ...options.headers };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || '请求失败');
  }

  return data;
}

export const api = {
  // Products
  getProducts: (params) => request(`/products?${new URLSearchParams(params)}`),
  getProduct: (id) => request(`/products/${id}`),

  // Orders
  createOrder: (body) => request('/orders', { method: 'POST', body: JSON.stringify(body) }),

  // Admin
  login: (password) => request('/admin/login', { method: 'POST', body: JSON.stringify({ password }) }),
  getDashboard: () => request('/admin/dashboard'),
  getAdminOrders: (params) => request(`/admin/orders?${new URLSearchParams(params)}`),
  updateOrderStatus: (id, status) => request(`/admin/orders/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  getAdminProducts: () => request('/admin/products'),
  createProduct: (data) => request('/admin/products', { method: 'POST', body: JSON.stringify(data) }),
  updateProduct: (id, data) => request(`/admin/products/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteProduct: (id) => request(`/admin/products/${id}`, { method: 'DELETE' }),
  updateProductStatus: (id, status) => request(`/admin/products/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  getSettings: () => request('/admin/settings'),
  updateSettings: (data) => request('/admin/settings', { method: 'PUT', body: JSON.stringify(data) }),
};
```

- [ ] **Step 2: 编写 client/src/hooks/useCart.js**

```js
import { useState, useEffect, useCallback } from 'react';

function loadCart() {
  try {
    const saved = localStorage.getItem('cart');
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

export function useCart() {
  const [items, setItems] = useState(loadCart);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items));
  }, [items]);

  const addItem = useCallback((product, qty = 1) => {
    setItems(prev => {
      const existing = prev.find(item => item.product_id === product.id);
      if (existing) {
        return prev.map(item =>
          item.product_id === product.id
            ? { ...item, qty: Math.min(item.qty + qty, product.stock) }
            : item
        );
      }
      return [...prev, {
        product_id: product.id,
        name: product.name,
        price: product.price,
        image: Array.isArray(product.images) ? product.images[0] : '',
        qty,
        stock: product.stock,
      }];
    });
  }, []);

  const updateQty = useCallback((productId, qty) => {
    if (qty <= 0) {
      setItems(prev => prev.filter(item => item.product_id !== productId));
    } else {
      setItems(prev => prev.map(item =>
        item.product_id === productId ? { ...item, qty } : item
      ));
    }
  }, []);

  const removeItem = useCallback((productId) => {
    setItems(prev => prev.filter(item => item.product_id !== productId));
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const totalAmount = items.reduce((sum, item) => sum + item.price * item.qty, 0);
  const totalCount = items.reduce((sum, item) => sum + item.qty, 0);

  return { items, addItem, updateQty, removeItem, clearCart, totalAmount, totalCount };
}
```

- [ ] **Step 3: 更新 client/src/App.jsx — 设置路由**

```jsx
import { Routes, Route } from 'react-router-dom';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderConfirm from './pages/OrderConfirm';
import ProductDetail from './pages/ProductDetail';
import ProductList from './pages/ProductList';
import AdminLogin from './admin/AdminLogin';
import AdminDashboard from './admin/AdminDashboard';
import AdminOrders from './admin/AdminOrders';
import AdminProducts from './admin/AdminProducts';
import AdminProductEdit from './admin/AdminProductEdit';
import AdminLayout from './admin/AdminLayout';

export default function App() {
  return (
    <div className="min-h-screen">
      <Routes>
        {/* Customer routes */}
        <Route path="/" element={<ProductList />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/order/:id" element={<OrderConfirm />} />

        {/* Admin routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="products/new" element={<AdminProductEdit />} />
          <Route path="products/:id/edit" element={<AdminProductEdit />} />
        </Route>
      </Routes>
    </div>
  );
}
```

- [ ] **Step 4: 创建占位页面文件**

```bash
cd d:/claude-project/client/src
mkdir -p pages admin components hooks utils
```

创建所有占位页面（内容为简单的 "组件名 loading..." div）：

```bash
for file in \
  pages/ProductList.jsx pages/ProductDetail.jsx pages/Cart.jsx \
  pages/Checkout.jsx pages/OrderConfirm.jsx \
  admin/AdminLogin.jsx admin/AdminLayout.jsx admin/AdminDashboard.jsx \
  admin/AdminOrders.jsx admin/AdminProducts.jsx admin/AdminProductEdit.jsx
do
  name=$(basename "$file" .jsx)
  echo "export default function $name() { return <div className='p-4'>$name</div>; }" > "$file"
done
```

- [ ] **Step 5: 验证前端编译**

```bash
cd d:/claude-project/client && npx vite build
# Expected: Build succeeds
```

- [ ] **Step 6: Commit**

```bash
cd d:/claude-project && git add -A && git commit -m "feat: add API utility, cart hook, and route structure"
```

---

### Task 8: 商品列表页

**Files:**
- Write: `client/src/pages/ProductList.jsx`

- [ ] **Step 1: 编写 ProductList.jsx**

```jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../utils/api';
import { useCart } from '../hooks/useCart';

export default function ProductList() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const { totalCount } = useCart();

  useEffect(() => {
    api.getProducts().then(data => {
      setProducts(data);
      const cats = [...new Set(data.map(p => p.category).filter(Boolean))];
      setCategories(cats);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const filteredProducts = selectedCategory
    ? products.filter(p => p.category === selectedCategory)
    : products;

  if (loading) {
    return <div className="p-4 text-center text-gray-400 mt-20">加载中...</div>;
  }

  return (
    <div className="pb-16">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white shadow-sm">
        <div className="flex items-center justify-between px-4 py-3">
          <h1 className="text-lg font-bold text-pink-600">尾货化妆品甩卖</h1>
          <Link to="/cart" className="relative">
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
            </svg>
            {totalCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-pink-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                {totalCount}
              </span>
            )}
          </Link>
        </div>

        {/* Category filter */}
        {categories.length > 0 && (
          <div className="flex gap-2 px-4 pb-3 overflow-x-auto">
            <button
              onClick={() => setSelectedCategory('')}
              className={`px-3 py-1 rounded-full text-sm whitespace-nowrap ${!selectedCategory ? 'bg-pink-500 text-white' : 'bg-gray-100 text-gray-600'}`}
            >
              全部
            </button>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-full text-sm whitespace-nowrap ${selectedCategory === cat ? 'bg-pink-500 text-white' : 'bg-gray-100 text-gray-600'}`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </header>

      {/* Product Grid */}
      <div className="p-3 grid grid-cols-2 gap-3">
        {filteredProducts.length === 0 ? (
          <div className="col-span-2 text-center text-gray-400 py-20">暂无商品</div>
        ) : (
          filteredProducts.map(product => (
            <Link
              key={product.id}
              to={`/product/${product.id}`}
              className="bg-white rounded-lg overflow-hidden shadow-sm active:shadow-none transition-shadow"
            >
              <div className="aspect-square bg-gray-100">
                {product.images[0] ? (
                  <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300 text-sm">暂无图片</div>
                )}
              </div>
              <div className="p-2">
                <h3 className="text-sm line-clamp-2 text-gray-800">{product.name}</h3>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-pink-600 font-bold text-base">¥{product.price}</span>
                  {product.original_price && (
                    <span className="text-gray-400 line-through text-xs">¥{product.original_price}</span>
                  )}
                </div>
                {product.stock <= 5 && product.stock > 0 && (
                  <span className="text-orange-500 text-xs">仅剩 {product.stock} 件</span>
                )}
                {product.stock === 0 && (
                  <span className="text-gray-400 text-xs">已售罄</span>
                )}
              </div>
            </Link>
          ))
        )}
      </div>

      {/* Bottom cart bar */}
      {totalCount > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-3">
          <Link
            to="/cart"
            className="flex items-center justify-center gap-2 bg-pink-500 text-white py-2.5 rounded-full font-medium"
          >
            购物车 ({totalCount}) — 去结算
          </Link>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: 验证编译**

```bash
cd d:/claude-project/client && npx vite build
# Expected: Build succeeds
```

- [ ] **Step 3: Commit**

```bash
cd d:/claude-project && git add -A && git commit -m "feat: add product list page with category filter"
```

---

### Task 9: 商品详情页

**Files:**
- Write: `client/src/pages/ProductDetail.jsx`

- [ ] **Step 1: 编写 ProductDetail.jsx**

```jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import { useCart } from '../hooks/useCart';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [qty, setQty] = useState(1);
  const { addItem } = useCart();

  useEffect(() => {
    api.getProduct(id)
      .then(data => { setProduct(data); setLoading(false); })
      .catch(() => { setLoading(false); });
  }, [id]);

  if (loading) return <div className="p-4 text-center text-gray-400 mt-20">加载中...</div>;
  if (!product) return <div className="p-4 text-center text-gray-400 mt-20">商品不存在</div>;

  const images = Array.isArray(product.images) ? product.images : [];
  const soldOut = product.stock <= 0 || product.status !== 'active';

  const handleAddToCart = () => {
    addItem(product, qty);
  };

  const handleBuyNow = () => {
    addItem(product, qty);
    navigate('/cart');
  };

  return (
    <div className="pb-6">
      {/* Back button */}
      <button onClick={() => navigate(-1)} className="fixed top-3 left-3 z-10 w-8 h-8 bg-white/80 rounded-full flex items-center justify-center shadow">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {/* Image carousel */}
      <div className="aspect-square bg-gray-100 relative">
        {images.length > 0 ? (
          <>
            <img src={images[selectedImage]} alt={product.name} className="w-full h-full object-cover" />
            {images.length > 1 && (
              <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1">
                {images.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`w-2 h-2 rounded-full ${i === selectedImage ? 'bg-white' : 'bg-white/50'}`}
                  />
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">暂无图片</div>
        )}
      </div>

      {/* Product info */}
      <div className="p-4">
        <h1 className="text-lg font-bold text-gray-900">{product.name}</h1>
        <div className="flex items-baseline gap-2 mt-2">
          <span className="text-2xl font-bold text-pink-600">¥{product.price}</span>
          {product.original_price && (
            <span className="text-gray-400 line-through">¥{product.original_price}</span>
          )}
        </div>

        <div className="mt-3 text-sm text-gray-500">
          库存：{soldOut ? <span className="text-red-500">已售罄</span> : `${product.stock} 件`}
        </div>

        {product.description && (
          <div className="mt-4 text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
            {product.description}
          </div>
        )}
      </div>

      {/* Quantity selector + Buy actions */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-3 flex items-center gap-3">
        {!soldOut && (
          <div className="flex items-center border rounded-lg">
            <button
              onClick={() => setQty(Math.max(1, qty - 1))}
              className="px-3 py-2 text-gray-500 active:bg-gray-100"
            >
              −
            </button>
            <span className="px-3 py-2 text-sm font-medium min-w-[2rem] text-center">{qty}</span>
            <button
              onClick={() => setQty(Math.min(product.stock, qty + 1))}
              className="px-3 py-2 text-gray-500 active:bg-gray-100"
            >
              +
            </button>
          </div>
        )}

        <button
          onClick={handleAddToCart}
          disabled={soldOut}
          className="flex-1 py-2.5 rounded-full font-medium border border-pink-500 text-pink-600 active:bg-pink-50 disabled:border-gray-200 disabled:text-gray-300"
        >
          加入购物车
        </button>

        <button
          onClick={handleBuyNow}
          disabled={soldOut}
          className="flex-1 py-2.5 rounded-full font-medium bg-pink-500 text-white active:bg-pink-600 disabled:bg-gray-200 disabled:text-gray-400"
        >
          {soldOut ? '已售罄' : '立即购买'}
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: 验证编译**

```bash
cd d:/claude-project/client && npx vite build
# Expected: Build succeeds
```

- [ ] **Step 3: Commit**

```bash
cd d:/claude-project && git add -A && git commit -m "feat: add product detail page with image carousel and quantity selector"
```

---

### Task 10: 购物车页

**Files:**
- Write: `client/src/pages/Cart.jsx`

- [ ] **Step 1: 编写 Cart.jsx**

```jsx
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../hooks/useCart';

export default function Cart() {
  const { items, updateQty, removeItem, totalAmount } = useCart();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <div className="p-4">
        <h1 className="text-lg font-bold text-center mb-2">购物车</h1>
        <div className="text-center text-gray-400 mt-20">
          <p className="text-4xl mb-3">🛒</p>
          <p>购物车是空的</p>
          <Link to="/" className="inline-block mt-4 px-6 py-2 bg-pink-500 text-white rounded-full text-sm">
            去逛逛
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-24">
      <h1 className="text-lg font-bold text-center py-3 border-b bg-white">购物车 ({items.length})</h1>

      <div className="m-3 space-y-3">
        {items.map(item => (
          <div key={item.product_id} className="bg-white rounded-lg p-3 flex gap-3">
            <div className="w-20 h-20 bg-gray-100 rounded-lg flex-shrink-0">
              {item.image ? (
                <img src={item.image} alt={item.name} className="w-full h-full object-cover rounded-lg" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">暂无</div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="text-sm text-gray-800 line-clamp-2">{item.name}</h3>
              <p className="text-pink-600 font-bold mt-1">¥{item.price}</p>

              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center border rounded">
                  <button onClick={() => updateQty(item.product_id, item.qty - 1)} className="px-2 py-1 text-gray-500 active:bg-gray-100">−</button>
                  <span className="px-2 py-1 text-sm min-w-[1.5rem] text-center">{item.qty}</span>
                  <button onClick={() => updateQty(item.product_id, item.qty + 1)} className="px-2 py-1 text-gray-500 active:bg-gray-100">+</button>
                </div>
                <button onClick={() => removeItem(item.product_id)} className="text-gray-400 text-sm active:text-red-500">删除</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-3">
        <div className="flex items-center justify-between mb-3">
          <span className="text-gray-600">合计</span>
          <span className="text-xl font-bold text-pink-600">¥{totalAmount.toFixed(2)}</span>
        </div>
        <button
          onClick={() => navigate('/checkout')}
          className="w-full py-2.5 bg-pink-500 text-white rounded-full font-medium active:bg-pink-600"
        >
          去结算
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: 验证编译**

```bash
cd d:/claude-project/client && npx vite build
# Expected: Build succeeds
```

- [ ] **Step 3: Commit**

```bash
cd d:/claude-project && git add -A && git commit -m "feat: add cart page with quantity controls"
```

---

### Task 11: 结算和订单确认页

**Files:**
- Write: `client/src/pages/Checkout.jsx`
- Write: `client/src/pages/OrderConfirm.jsx`

- [ ] **Step 1: 编写 Checkout.jsx**

```jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import { api } from '../utils/api';

export default function Checkout() {
  const { items, totalAmount, clearCart } = useCart();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      setError('请填写姓名和手机号');
      return;
    }
    setSubmitting(true);
    setError('');

    try {
      const order = await api.createOrder({
        customer_name: name.trim(),
        customer_phone: phone.trim(),
        items: items.map(({ product_id, name, price, qty }) => ({ product_id, name, price, qty })),
        note: note.trim(),
      });
      clearCart();
      navigate(`/order/${order.id}`, { state: { order } });
    } catch (e) {
      setError(e.message);
      setSubmitting(false);
    }
  };

  return (
    <div className="pb-6">
      <h1 className="text-lg font-bold text-center py-3 border-b bg-white">确认订单</h1>

      {/* Order summary */}
      <div className="m-3 bg-white rounded-lg p-3">
        <h2 className="text-sm font-medium text-gray-600 mb-2">商品明细</h2>
        {items.map(item => (
          <div key={item.product_id} className="flex justify-between py-2 text-sm">
            <span className="text-gray-800">{item.name} × {item.qty}</span>
            <span className="text-gray-600">¥{(item.price * item.qty).toFixed(2)}</span>
          </div>
        ))}
        <div className="flex justify-between pt-2 mt-2 border-t font-bold">
          <span>合计</span>
          <span className="text-pink-600">¥{totalAmount.toFixed(2)}</span>
        </div>
      </div>

      {/* Customer info form */}
      <form onSubmit={handleSubmit} className="m-3 bg-white rounded-lg p-3">
        <h2 className="text-sm font-medium text-gray-600 mb-3">收货信息</h2>

        {error && (
          <div className="mb-3 p-2 bg-red-50 text-red-500 text-sm rounded">{error}</div>
        )}

        <div className="space-y-3">
          <div>
            <label className="text-xs text-gray-500">姓名 *</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="请输入姓名"
              className="w-full mt-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:border-pink-500"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500">手机号 *</label>
            <input
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="请输入手机号"
              className="w-full mt-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:border-pink-500"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500">备注</label>
            <textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="选填：给卖家的留言"
              rows={2}
              className="w-full mt-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:border-pink-500 resize-none"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full mt-4 py-2.5 bg-pink-500 text-white rounded-full font-medium active:bg-pink-600 disabled:bg-gray-300"
        >
          {submitting ? '提交中...' : `提交订单 ¥${totalAmount.toFixed(2)}`}
        </button>
      </form>
    </div>
  );
}
```

- [ ] **Step 2: 编写 OrderConfirm.jsx**

```jsx
import { useParams, useLocation, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { api } from '../utils/api';

export default function OrderConfirm() {
  const { id } = useParams();
  const location = useLocation();
  const [order, setOrder] = useState(location.state?.order || null);
  const [qrcode, setQrcode] = useState('');

  useEffect(() => {
    if (!order) {
      api.createOrder; // Order already created, we just need display
    }
    api.getSettings().then(s => {
      if (s.payment_qrcode) setQrcode(s.payment_qrcode);
    }).catch(() => {});
  }, [id]);

  if (!order) {
    return <div className="p-4 text-center text-gray-400 mt-20">订单加载中...</div>;
  }

  return (
    <div className="p-4 max-w-md mx-auto">
      {/* Success header */}
      <div className="text-center mt-8">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
          <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-lg font-bold mt-3">下单成功！</h1>
        <p className="text-sm text-gray-500 mt-1">订单编号：{order.id}</p>
      </div>

      {/* Order details */}
      <div className="bg-white rounded-lg p-4 mt-6">
        <h2 className="text-sm font-medium text-gray-600 mb-2">订单详情</h2>
        <div className="text-sm space-y-2">
          <div className="flex justify-between"><span className="text-gray-500">客户</span><span>{order.customer_name}</span></div>
          <div className="flex justify-between"><span className="text-gray-500">手机</span><span>{order.customer_phone}</span></div>
          <div className="flex justify-between"><span className="text-gray-500">金额</span><span className="text-pink-600 font-bold">¥{order.total_amount.toFixed(2)}</span></div>
          <div className="border-t pt-2 mt-2">
            {order.items.map((item, i) => (
              <div key={i} className="flex justify-between py-1">
                <span>{item.name} × {item.qty}</span>
                <span>¥{(item.price * item.qty).toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Payment info */}
      <div className="bg-white rounded-lg p-4 mt-4 text-center">
        <h2 className="text-sm font-medium text-gray-600 mb-3">请扫码付款</h2>
        {qrcode ? (
          <img src={qrcode} alt="收款码" className="w-48 h-48 mx-auto" />
        ) : (
          <div className="w-48 h-48 mx-auto bg-gray-100 rounded flex items-center justify-center text-gray-400 text-sm">
            收款码待设置
          </div>
        )}
        <p className="text-pink-600 font-bold text-lg mt-3">¥{order.total_amount.toFixed(2)}</p>
        <p className="text-gray-500 text-xs mt-2">付款后请联系卖家确认</p>
      </div>

      <Link
        to="/"
        className="block text-center mt-4 py-2.5 bg-pink-500 text-white rounded-full font-medium active:bg-pink-600"
      >
        继续逛逛
      </Link>
    </div>
  );
}
```

- [ ] **Step 3: 验证编译**

```bash
cd d:/claude-project/client && npx vite build
# Expected: Build succeeds
```

- [ ] **Step 4: Commit**

```bash
cd d:/claude-project && git add -A && git commit -m "feat: add checkout and order confirmation pages"
```

---

### Task 12: 管理后台登录页和布局

**Files:**
- Write: `client/src/admin/AdminLogin.jsx`
- Write: `client/src/admin/AdminLayout.jsx`

- [ ] **Step 1: 编写 AdminLogin.jsx**

```jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/api';

export default function AdminLogin() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { token } = await api.login(password);
      localStorage.setItem('admin_token', token);
      navigate('/admin');
    } catch (e) {
      setError(e.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-sm">
        <h1 className="text-xl font-bold text-center text-pink-600 mb-8">管理后台</h1>
        <form onSubmit={handleSubmit} className="bg-white rounded-lg p-6 shadow-sm">
          {error && <div className="mb-3 p-2 bg-red-50 text-red-500 text-sm rounded">{error}</div>}
          <label className="text-sm text-gray-600">管理密码</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="请输入管理密码"
            className="w-full mt-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:border-pink-500"
            autoFocus
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 py-2.5 bg-pink-500 text-white rounded-lg font-medium active:bg-pink-600 disabled:bg-gray-300"
          >
            {loading ? '登录中...' : '登录'}
          </button>
        </form>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: 编写 AdminLayout.jsx**

```jsx
import { useEffect, useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      navigate('/admin/login');
    } else {
      setAuthed(true);
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    navigate('/admin/login');
  };

  if (!authed) return null;

  const tabs = [
    { path: '/admin', label: '概览', exact: true },
    { path: '/admin/orders', label: '订单' },
    { path: '/admin/products', label: '商品' },
  ];

  const isActive = (tab) => tab.exact ? location.pathname === '/admin' : location.pathname.startsWith(tab.path);

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      {/* Top bar */}
      <header className="bg-white border-b px-4 py-3 flex items-center justify-between">
        <h1 className="font-bold text-pink-600">管理后台</h1>
        <button onClick={handleLogout} className="text-sm text-gray-500">退出</button>
      </header>

      {/* Content */}
      <div className="p-3">
        <Outlet />
      </div>

      {/* Bottom tabs */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t flex">
        {tabs.map(tab => (
          <Link
            key={tab.path}
            to={tab.path}
            className={`flex-1 text-center py-3 text-sm ${isActive(tab) ? 'text-pink-600 font-medium' : 'text-gray-500'}`}
          >
            {tab.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
```

- [ ] **Step 3: 验证编译**

```bash
cd d:/claude-project/client && npx vite build
# Expected: Build succeeds
```

- [ ] **Step 4: Commit**

```bash
cd d:/claude-project && git add -A && git commit -m "feat: add admin login page and layout with auth guard"
```

---

### Task 13: 管理后台 — 概览、订单管理、商品管理

**Files:**
- Write: `client/src/admin/AdminDashboard.jsx`
- Write: `client/src/admin/AdminOrders.jsx`
- Write: `client/src/admin/AdminProducts.jsx`
- Write: `client/src/admin/AdminProductEdit.jsx`

- [ ] **Step 1: 编写 AdminDashboard.jsx**

```jsx
import { useState, useEffect } from 'react';
import { api } from '../utils/api';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.getDashboard().then(setStats).catch(() => {});
  }, []);

  if (!stats) return <div className="text-center text-gray-400 py-10">加载中...</div>;

  const cards = [
    { label: '今日订单', value: stats.todayOrders, color: 'bg-blue-50 text-blue-600' },
    { label: '待处理', value: stats.pendingOrders, color: 'bg-orange-50 text-orange-600' },
    { label: '今日收入', value: `¥${stats.todayRevenue.toFixed(2)}`, color: 'bg-green-50 text-green-600' },
    { label: '在售商品', value: stats.totalProducts, color: 'bg-purple-50 text-purple-600' },
  ];

  return (
    <div>
      <h2 className="text-sm text-gray-500 mb-3">今日概览</h2>
      <div className="grid grid-cols-2 gap-3">
        {cards.map(card => (
          <div key={card.label} className={`rounded-lg p-4 ${card.color}`}>
            <div className="text-2xl font-bold">{card.value}</div>
            <div className="text-sm mt-1 opacity-75">{card.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: 编写 AdminOrders.jsx**

```jsx
import { useState, useEffect } from 'react';
import { api } from '../utils/api';

const STATUS_MAP = {
  pending:   { label: '待确认', color: 'bg-yellow-100 text-yellow-700' },
  paid:      { label: '已付款', color: 'bg-blue-100 text-blue-700' },
  shipped:   { label: '已发货', color: 'bg-purple-100 text-purple-700' },
  completed: { label: '已完成', color: 'bg-green-100 text-green-700' },
  cancelled: { label: '已取消', color: 'bg-gray-100 text-gray-500' },
};

const STATUS_FLOW = {
  pending: ['paid', 'cancelled'],
  paid: ['shipped', 'cancelled'],
  shipped: ['completed'],
  completed: [],
  cancelled: [],
};

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchOrders = () => {
    const params = filter ? { status: filter } : {};
    api.getAdminOrders(params).then(data => { setOrders(data); setLoading(false); }).catch(() => setLoading(false));
  };

  useEffect(() => { fetchOrders(); }, [filter]);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await api.updateOrderStatus(orderId, newStatus);
      fetchOrders();
    } catch (e) {
      alert(e.message);
    }
  };

  if (loading) return <div className="text-center text-gray-400 py-10">加载中...</div>;

  return (
    <div>
      {/* Filter tabs */}
      <div className="flex gap-2 mb-3 overflow-x-auto">
        {[
          { value: '', label: '全部' },
          { value: 'pending', label: '待确认' },
          { value: 'paid', label: '已付款' },
          { value: 'shipped', label: '已发货' },
          { value: 'completed', label: '已完成' },
        ].map(f => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`px-3 py-1 rounded-full text-sm whitespace-nowrap ${filter === f.value ? 'bg-pink-500 text-white' : 'bg-gray-100 text-gray-600'}`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Order list */}
      {orders.length === 0 ? (
        <div className="text-center text-gray-400 py-10">暂无订单</div>
      ) : (
        <div className="space-y-3">
          {orders.map(order => (
            <div key={order.id} className="bg-white rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500">#{order.id}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_MAP[order.status]?.color}`}>
                  {STATUS_MAP[order.status]?.label}
                </span>
              </div>

              {order.items.map((item, i) => (
                <div key={i} className="text-sm flex justify-between py-1">
                  <span>{item.name} × {item.qty}</span>
                  <span>¥{(item.price * item.qty).toFixed(2)}</span>
                </div>
              ))}

              <div className="flex justify-between mt-2 pt-2 border-t text-sm">
                <span>{order.customer_name} {order.customer_phone}</span>
                <span className="font-bold text-pink-600">¥{order.total_amount.toFixed(2)}</span>
              </div>

              {order.note && (
                <div className="mt-1 text-xs text-gray-400">备注：{order.note}</div>
              )}

              <div className="text-xs text-gray-400 mt-1">{order.created_at}</div>

              {/* Action buttons */}
              {STATUS_FLOW[order.status]?.length > 0 && (
                <div className="flex gap-2 mt-3">
                  {STATUS_FLOW[order.status].map(nextStatus => (
                    <button
                      key={nextStatus}
                      onClick={() => handleStatusChange(order.id, nextStatus)}
                      className={`text-xs px-3 py-1 rounded-full ${
                        nextStatus === 'cancelled'
                          ? 'border border-gray-300 text-gray-500'
                          : 'bg-pink-500 text-white'
                      }`}
                    >
                      {nextStatus === 'paid' ? '确认收款' :
                       nextStatus === 'shipped' ? '标记发货' :
                       nextStatus === 'completed' ? '完成' :
                       nextStatus === 'cancelled' ? '取消' : nextStatus}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 3: 编写 AdminProducts.jsx**

```jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../utils/api';

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = () => {
    api.getAdminProducts().then(data => { setProducts(data); setLoading(false); }).catch(() => setLoading(false));
  };

  useEffect(() => { fetchProducts(); }, []);

  const handleToggleStatus = async (product) => {
    const newStatus = product.status === 'active' ? 'hidden' : 'active';
    await api.updateProductStatus(product.id, newStatus);
    fetchProducts();
  };

  const handleDelete = async (product) => {
    if (!window.confirm(`确定删除 "${product.name}" 吗？`)) return;
    await api.deleteProduct(product.id);
    fetchProducts();
  };

  if (loading) return <div className="text-center text-gray-400 py-10">加载中...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm text-gray-500">共 {products.length} 件商品</h2>
        <Link to="/admin/products/new" className="px-4 py-1.5 bg-pink-500 text-white text-sm rounded-full">
          + 新增
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="text-center text-gray-400 py-10">暂无商品，点击上方新增</div>
      ) : (
        <div className="space-y-2">
          {products.map(product => (
            <div key={product.id} className="bg-white rounded-lg p-3 flex gap-3">
              <div className="w-16 h-16 bg-gray-100 rounded-lg flex-shrink-0">
                {product.images[0] ? (
                  <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover rounded-lg" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">暂无</div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <h3 className="text-sm text-gray-800 line-clamp-1">{product.name}</h3>
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ml-2 flex-shrink-0 ${
                    product.status === 'active' ? 'bg-green-100 text-green-600' :
                    product.status === 'sold_out' ? 'bg-gray-100 text-gray-500' :
                    'bg-red-50 text-red-500'
                  }`}>
                    {product.status === 'active' ? '在售' : product.status === 'sold_out' ? '售罄' : '隐藏'}
                  </span>
                </div>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-pink-600 font-bold text-sm">¥{product.price}</span>
                  <span className="text-gray-400 text-xs">库存 {product.stock}</span>
                </div>

                <div className="flex gap-2 mt-2">
                  <Link
                    to={`/admin/products/${product.id}/edit`}
                    className="text-xs px-2 py-1 text-blue-600 bg-blue-50 rounded"
                  >
                    编辑
                  </Link>
                  <button
                    onClick={() => handleToggleStatus(product)}
                    className={`text-xs px-2 py-1 rounded ${product.status === 'active' ? 'text-orange-600 bg-orange-50' : 'text-green-600 bg-green-50'}`}
                  >
                    {product.status === 'active' ? '下架' : '上架'}
                  </button>
                  <button
                    onClick={() => handleDelete(product)}
                    className="text-xs px-2 py-1 text-red-500 bg-red-50 rounded"
                  >
                    删除
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 4: 编写 AdminProductEdit.jsx**

```jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../utils/api';

export default function AdminProductEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = !id;

  const [form, setForm] = useState({
    name: '', description: '', price: '', original_price: '',
    images: '', stock: '0', category: '', status: 'active',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isNew) {
      api.getProduct(id).then(product => {
        setForm({
          name: product.name,
          description: product.description || '',
          price: String(product.price),
          original_price: product.original_price ? String(product.original_price) : '',
          images: Array.isArray(product.images) ? product.images.join('\n') : '',
          stock: String(product.stock),
          category: product.category || '',
          status: product.status,
        });
      });
    }
  }, [id]);

  const handleChange = (field) => (e) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.price) {
      setError('商品名称和价格不能为空');
      return;
    }

    setLoading(true);
    setError('');

    const data = {
      name: form.name,
      description: form.description,
      price: parseFloat(form.price),
      original_price: form.original_price ? parseFloat(form.original_price) : null,
      images: form.images ? form.images.split('\n').map(s => s.trim()).filter(Boolean) : [],
      stock: parseInt(form.stock) || 0,
      category: form.category,
      status: form.status,
    };

    try {
      if (isNew) {
        await api.createProduct(data);
      } else {
        await api.updateProduct(id, data);
      }
      navigate('/admin/products');
    } catch (e) {
      setError(e.message);
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-lg font-bold mb-4">{isNew ? '新增商品' : '编辑商品'}</h2>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg p-4 space-y-4">
        {error && <div className="p-2 bg-red-50 text-red-500 text-sm rounded">{error}</div>}

        <div>
          <label className="text-xs text-gray-500">商品名称 *</label>
          <input type="text" value={form.name} onChange={handleChange('name')} placeholder="商品名称"
            className="w-full mt-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:border-pink-500" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-gray-500">售价 *</label>
            <input type="number" step="0.01" value={form.price} onChange={handleChange('price')} placeholder="29.9"
              className="w-full mt-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:border-pink-500" />
          </div>
          <div>
            <label className="text-xs text-gray-500">原价</label>
            <input type="number" step="0.01" value={form.original_price} onChange={handleChange('original_price')} placeholder="99.0"
              className="w-full mt-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:border-pink-500" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-gray-500">库存数量</label>
            <input type="number" value={form.stock} onChange={handleChange('stock')}
              className="w-full mt-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:border-pink-500" />
          </div>
          <div>
            <label className="text-xs text-gray-500">分类</label>
            <input type="text" value={form.category} onChange={handleChange('category')} placeholder="如：口红、面膜"
              className="w-full mt-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:border-pink-500" />
          </div>
        </div>

        <div>
          <label className="text-xs text-gray-500">图片（每行一个 URL）</label>
          <textarea value={form.images} onChange={handleChange('images')} placeholder="https://example.com/img1.jpg&#10;https://example.com/img2.jpg"
            rows={3} className="w-full mt-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:border-pink-500 resize-none" />
        </div>

        <div>
          <label className="text-xs text-gray-500">描述</label>
          <textarea value={form.description} onChange={handleChange('description')} placeholder="商品详情描述"
            rows={4} className="w-full mt-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:border-pink-500 resize-none" />
        </div>

        {!isNew && (
          <div>
            <label className="text-xs text-gray-500">状态</label>
            <select value={form.status} onChange={handleChange('status')}
              className="w-full mt-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:border-pink-500">
              <option value="active">在售</option>
              <option value="sold_out">售罄</option>
              <option value="hidden">隐藏</option>
            </select>
          </div>
        )}

        <button type="submit" disabled={loading}
          className="w-full py-2.5 bg-pink-500 text-white rounded-full font-medium active:bg-pink-600 disabled:bg-gray-300">
          {loading ? '保存中...' : '保存'}
        </button>
      </form>
    </div>
  );
}
```

- [ ] **Step 5: 验证完整编译和 API 集成**

```bash
cd d:/claude-project/server && node src/index.js &
sleep 2

cd d:/claude-project/client && npx vite build
# Expected: Build succeeds

# Full integration test:
# 1. Create a product via admin API
TOKEN=$(curl -s -X POST http://localhost:3001/api/admin/login -H "Content-Type: application/json" -d '{"password":"admin123"}' | grep -o '"token":"[^"]*' | cut -d'"' -f4)

curl -X POST http://localhost:3001/api/admin/products -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN" -d '{"name":"口红套装","price":39.9,"original_price":128,"stock":20,"category":"口红","images":[]}'

# 2. Verify product shows in public API
curl http://localhost:3001/api/products
# Expected: Product shows with status active

kill %1
```

- [ ] **Step 6: Commit**

```bash
cd d:/claude-project && git add -A && git commit -m "feat: add admin dashboard, orders management, and product CRUD"
```

---

### Task 14: 启动说明和 README

**Files:**
- Create: `README.md`

- [ ] **Step 1: 编写 README.md**

```markdown
# 尾货化妆品甩卖商城

移动端 H5 商城，微信内打开体验最佳。支持商品浏览、购物车、下单，以及管理后台。

## 快速开始

### 安装依赖

```bash
cd client && npm install
cd ../server && npm install
```

### 启动后端

```bash
cd server
npm run dev
# 运行在 http://localhost:3001
```

### 启动前端

```bash
cd client
npm run dev
# 运行在 http://localhost:5173
```

## 使用说明

### 客户端（客户浏览下单）

- 打开 `http://localhost:5173` 进入商城
- 浏览商品 → 加入购物车 → 结算填信息 → 下单成功 → 扫码付款

### 管理后台（商家管理）

- 打开 `http://localhost:5173/admin/login`
- 默认密码：`admin123`（环境变量 `ADMIN_PASSWORD` 可修改）
- 管理商品：新增、编辑、下架、删除
- 管理订单：查看、确认收款、发货、完成

## 部署

### 后端部署到 Railway

1. 在 Railway 创建新项目，指向 `server/` 目录
2. 设置环境变量：
   - `ADMIN_PASSWORD=你的密码`
   - `PORT=3001`

### 前端部署到 Vercel

1. 在 Vercel 导入项目，设置 root directory 为 `client/`
2. 设置环境变量 `VITE_API_URL` 指向 Railway 后端地址
3. 部署

## 修改管理密码

方式一：环境变量

```bash
ADMIN_PASSWORD=新密码 npm run dev
```

方式二：管理后台修改（登录后通过设置 API）

## 技术栈

- React 18 + Vite + Tailwind CSS
- Express + better-sqlite3
```

- [ ] **Step 2: 最终验证**

```bash
cd d:/claude-project
# 确保完整的文件结构
find . -type f \( -name "*.jsx" -o -name "*.js" -o -name "*.json" -o -name "*.css" -o -name "*.html" -o -name "*.md" \) | grep -v node_modules | sort
```

- [ ] **Step 3: Commit**

```bash
cd d:/claude-project && git add -A && git commit -m "docs: add README with setup and deployment instructions"
```
