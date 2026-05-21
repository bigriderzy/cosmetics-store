import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { getDb } from './db.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Serve uploaded files
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

import productRoutes from './routes/products.js';
app.use('/api/products', productRoutes);

import orderRoutes from './routes/orders.js';
app.use('/api/orders', orderRoutes);

import adminRoutes from './routes/admin.js';
app.use('/api/admin', adminRoutes);

import publicRoutes from './routes/public.js';
app.use('/api/public', publicRoutes);

// Initialize database on startup
getDb();

app.get('/api/health', (req, res) => {
  res.json({ ok: true });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
