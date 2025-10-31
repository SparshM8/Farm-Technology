/**
 * Seed products into the local SQLite DB from products.json
 * - Inserts missing products (INSERT OR IGNORE)
 * - Parses price strings into price_value (cents)
 *
 * Usage: node scripts/seed-products.js
 */
const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const ROOT = path.resolve(__dirname, '..');
const dbPath = path.join(ROOT, 'data', 'data.db');
const productsPath = path.join(ROOT, 'products.json');

if (!fs.existsSync(productsPath)) {
  console.error('products.json not found at', productsPath);
  process.exit(1);
}

const raw = fs.readFileSync(productsPath, 'utf8');
const products = JSON.parse(raw);

if (!fs.existsSync(dbPath)) {
  console.error('SQLite DB not found at', dbPath);
  process.exit(1);
}

function slugify(s) {
  return String(s)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 64);
}

function parsePriceValue(price, price_value) {
  if (typeof price_value === 'number' && Number.isFinite(price_value)) return price_value;
  if (!price) return null;
  const m = String(price).match(/\d+(?:\.\d+)?/);
  if (!m) return null;
  return Math.round(parseFloat(m[0]) * 100);
}

const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='products'", (err, row) => {
    if (err) {
      console.error('Error checking products table:', err);
      process.exit(1);
    }
    if (!row) {
      console.error('No `products` table found in DB. Aborting.');
      process.exit(1);
    }

    const insertStmt = db.prepare(
      `INSERT OR IGNORE INTO products (id, title, description, price, price_value, image) VALUES (?,?,?,?,?,?)`
    );

    let inserted = 0;
    products.forEach((p) => {
      const id = p.id ? String(p.id) : slugify(p.title || Math.random().toString(36).slice(2, 9));
      const title = p.title || '';
      const description = p.description || '';
      const price = p.price ? String(p.price) : null;
      const price_value = parsePriceValue(p.price, p.price_value);
      const image = p.image || null;

      insertStmt.run(id, title, description, price, price_value, image, function (err) {
        if (err) {
          console.error('Insert error for', id, err.message);
          return;
        }
        if (this.changes && this.changes > 0) inserted += this.changes;
      });
    });

    insertStmt.finalize((err) => {
      if (err) console.error('Finalize error', err);
      console.log(`Seed complete. Inserted ${inserted} new product(s) (INSERT OR IGNORE).`);
      db.close();
    });
  });
});
