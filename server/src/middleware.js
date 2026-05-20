import crypto from 'crypto';
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
