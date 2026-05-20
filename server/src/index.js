import express from 'express';
import cors from 'cors';
import { getDb } from './db.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

import productRoutes from './routes/products.js';
app.use('/api/products', productRoutes);

import orderRoutes from './routes/orders.js';
app.use('/api/orders', orderRoutes);

import adminRoutes from './routes/admin.js';
app.use('/api/admin', adminRoutes);

// Initialize database on startup
getDb();

app.get('/api/health', (req, res) => {
  res.json({ ok: true });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
