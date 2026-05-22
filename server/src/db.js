import initSqlJs from 'sql.js';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = process.env.DB_PATH || path.join(__dirname, '..', 'data', 'store.db');

const SQL = await initSqlJs();

let rawDb;
let txnDepth = 0;

function getRawDb() {
  if (!rawDb) {
    const dir = path.dirname(DB_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    if (fs.existsSync(DB_PATH)) {
      const buffer = fs.readFileSync(DB_PATH);
      rawDb = new SQL.Database(buffer);
    } else {
      rawDb = new SQL.Database();
    }
  }
  return rawDb;
}

function saveDb() {
  if (txnDepth > 0) return; // Don't export during transaction — it kills the txn
  const data = rawDb.export();
  fs.writeFileSync(DB_PATH, Buffer.from(data));
}

function createStatement(rdb, sql) {
  return {
    get(...params) {
      try {
        const stmt = rdb.prepare(sql);
        if (params.length > 0) stmt.bind(params);
        let result;
        if (stmt.step()) {
          result = stmt.getAsObject();
        }
        stmt.free();
        return result;
      } catch (e) {
        console.error('SQL get error:', e.message, sql);
        return undefined;
      }
    },

    all(...params) {
      try {
        const stmt = rdb.prepare(sql);
        if (params.length > 0) stmt.bind(params);
        const results = [];
        while (stmt.step()) {
          results.push(stmt.getAsObject());
        }
        stmt.free();
        return results;
      } catch (e) {
        console.error('SQL all error:', e.message, sql);
        return [];
      }
    },

    run(...params) {
      try {
        rdb.run(sql, params);
        let lastInsertRowid = 0;
        if (/^\s*INSERT/i.test(sql)) {
          const idStmt = rdb.prepare('SELECT last_insert_rowid() as id');
          if (idStmt.step()) {
            lastInsertRowid = idStmt.getAsObject().id;
          }
          idStmt.free();
        }
        saveDb();
        return { lastInsertRowid };
      } catch (e) {
        console.error('SQL run error:', e.message, sql);
        throw e;
      }
    },
  };
}

function initTables(rdb) {
  rdb.run(`CREATE TABLE IF NOT EXISTS products (
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
  )`);

  rdb.run(`CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    items TEXT NOT NULL,
    total_amount REAL NOT NULL,
    status TEXT DEFAULT 'pending' CHECK(status IN ('pending','paid','shipped','completed','cancelled')),
    note TEXT DEFAULT '',
    created_at TEXT DEFAULT (datetime('now','localtime')),
    updated_at TEXT DEFAULT (datetime('now','localtime'))
  )`);

  rdb.run(`CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  )`);

  // Seed defaults
  const adminPwd = rdb.prepare("SELECT value FROM settings WHERE key = 'admin_password'");
  if (!adminPwd.step()) {
    rdb.run("INSERT INTO settings (key, value) VALUES ('admin_password', 'admin123')");
    rdb.run("INSERT INTO settings (key, value) VALUES ('payment_qrcode', '')");
  }
  adminPwd.free();

  saveDb();
}

export function getDb() {
  const rdb = getRawDb();

  // Ensure tables exist on first access
  const tableCheck = rdb.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='products'");
  const hasTables = tableCheck.step();
  tableCheck.free();

  if (!hasTables) {
    initTables(rdb);
  }

  return {
    prepare(sql) {
      return createStatement(rdb, sql);
    },

    exec(sql) {
      rdb.run(sql);
      saveDb();
    },

    pragma(pragmaStr) {
      rdb.run(`PRAGMA ${pragmaStr}`);
      saveDb();
    },

    transaction(fn) {
      return (...args) => {
        txnDepth++;
        rdb.run('BEGIN');
        try {
          const result = fn(...args);
          rdb.run('COMMIT');
          txnDepth--;
          saveDb();
          return result;
        } catch (e) {
          try { rdb.run('ROLLBACK'); } catch (_) {}
          txnDepth--;
          saveDb();
          throw e;
        }
      };
    },
  };
}

export default getDb;
