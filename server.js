const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const fs = require('fs');
const bodyParser = require('body-parser');
const cors = require('cors');
const multer = require('multer');
const session = require('express-session');
const SQLiteStore = require('connect-sqlite3')(session);
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const rateLimit = require('express-rate-limit');
const nodemailer = require('nodemailer');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '/')));

// Add a development Content-Security-Policy that allows Google Fonts and CDNJS
// (loads external stylesheets used by the site). Tighten this for production.
app.use((req, res, next) => {
  const csp = [
    "default-src 'self' data: blob:",
    // allow scripts from CDNJS and inline scripts
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdnjs.cloudflare.com",
    // allow styles from Google Fonts and CDNJS and inline styles for legacy usage
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdnjs.cloudflare.com https:",
    // allow fonts from Google and CDN
    "font-src 'self' https://fonts.gstatic.com https://cdnjs.cloudflare.com https:",
    // allow images from same origin and data/blob URLs
    "img-src 'self' data: blob: https:",
    // allow websocket and XHR/fetch to local server
    "connect-src 'self' ws://localhost:3000 wss://localhost:3000 http://localhost:3000 https://localhost:3000",
  ].join('; ');

  res.setHeader('Content-Security-Policy', csp);
  next();
});

// session middleware (demo only — use secure store for production)
app.use(session({
  store: new SQLiteStore({ db: 'sessions.sqlite', dir: './data' }),
  secret: process.env.SESSION_SECRET || 'devsecret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 24 * 60 * 60 * 1000,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax'
  }
}));

// Prepare admin password hash in memory. Prefer using ADMIN_PASSWORD_HASH env var in production.
let ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH || null;
const ADMIN_PASSWORD_PLAIN = process.env.ADMIN_PASSWORD || 'PASSCODE';
if (!ADMIN_PASSWORD_HASH) {
  // hash the provided plain password at startup (works for dev/testing). In production, set ADMIN_PASSWORD_HASH directly.
  ADMIN_PASSWORD_HASH = bcrypt.hashSync(ADMIN_PASSWORD_PLAIN, 10);
}

// Rate limiters
const loginLimiter = rateLimit({ windowMs: 60 * 1000, max: 6, message: { status: 'error', message: 'Too many login attempts, try again later.' } });
const checkoutLimiter = rateLimit({ windowMs: 60 * 1000, max: 60, message: { status: 'error', message: 'Slow down — too many requests.' } });

function requireAdmin(req, res, next) {
  if (req.session && req.session.isAdmin) return next();
  return res.status(401).json({ status: 'error', message: 'Unauthorized' });
}
// serve uploaded images
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);
app.use('/uploads', express.static(uploadsDir));

// multer setup for uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const unique = Date.now() + '-' + file.originalname.replace(/\s+/g,'-');
    cb(null, unique);
  }
});
const upload = multer({ storage: storage });

const PRODUCTS_FILE = path.join(__dirname, 'products.json');

// --- SQLite DB setup ---
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);
const DB_FILE = process.env.TEST_DB_FILE || path.join(dataDir, 'data.db');
const db = new sqlite3.Database(DB_FILE);

// Optional mailer setup: configure via env vars
let mailer = null;
const ADMIN_NOTIFICATION_EMAIL = process.env.ADMIN_NOTIFICATION_EMAIL || process.env.FROM_EMAIL || null;
if (process.env.SMTP_HOST && ADMIN_NOTIFICATION_EMAIL) {
  try {
    mailer = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined
    });
    // verify transporter
    mailer.verify().then(() => console.log('Mailer configured (SMTP)')).catch(err => console.warn('Mailer verify failed:', err.message));
  } catch (e) {
    console.warn('Failed to configure mailer:', e.message);
    mailer = null;
  }
}

async function notifyAdminOfNewOrder(order) {
  if (!mailer || !ADMIN_NOTIFICATION_EMAIL) return;
  try {
    const items = Array.isArray(order.items) ? order.items : [];
    const htmlItems = items.map(i => `<li>${i.qty}× ${i.title} @ ${i.unit_price}</li>`).join('');
    const html = `
      <p>New order received (ID: ${order.id})</p>
      <p><strong>Total:</strong> ${order.total}</p>
      <p><strong>Customer:</strong> ${order.customerName} — ${order.customerPhone}</p>
      <p><strong>Address:</strong> ${order.customerAddress}</p>
      <p><strong>Items:</strong></p>
      <ul>${htmlItems}</ul>
    `;
    await mailer.sendMail({
      from: process.env.FROM_EMAIL || `no-reply@${require('os').hostname()}`,
      to: ADMIN_NOTIFICATION_EMAIL,
      subject: `New Order #${order.id} — ${order.total}`,
      html
    });
  } catch (err) {
    console.warn('Failed to send new order notification:', err.message);
  }
}

async function notifyAdminOfStatusChange(order) {
  if (!mailer || !ADMIN_NOTIFICATION_EMAIL) return;
  try {
    const html = `
      <p>Order #${order.id} status updated to <strong>${order.status}</strong></p>
      <p><strong>Customer:</strong> ${order.customer_name} — ${order.customer_phone}</p>
      <p><strong>Total:</strong> ${order.total_price}</p>
      <p>View order details on your admin panel.</p>
    `;
    await mailer.sendMail({
      from: process.env.FROM_EMAIL || `no-reply@${require('os').hostname()}`,
      to: ADMIN_NOTIFICATION_EMAIL,
      subject: `Order #${order.id} status: ${order.status}`,
      html
    });
  } catch (err) {
    console.warn('Failed to send order status notification:', err.message);
  }
}

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY,
    title TEXT,
    image TEXT,
    price TEXT,
    description TEXT,
    price_value REAL,
    created_at INTEGER
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS contacts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    email TEXT,
    message TEXT,
    received_at INTEGER
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS news (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    excerpt TEXT,
    link TEXT,
    date TEXT,
    created_at INTEGER
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_name TEXT,
    customer_address TEXT,
    customer_phone TEXT,
    items TEXT,
    total_price TEXT,
    order_date INTEGER
  )`);
});

// Seed products if none exist (use products.json as source)
try {
  db.get('SELECT COUNT(*) as c FROM products', (err, row) => {
    if (err) return console.warn('Failed to count products:', err.message);
    const count = row && row.c ? row.c : 0;
    if (count === 0) {
      const pj = path.join(__dirname, 'products.json');
      if (fs.existsSync(pj)) {
        try {
          const raw = fs.readFileSync(pj, 'utf8');
          const arr = JSON.parse(raw || '[]');
          const insert = db.prepare('INSERT INTO products (title,image,price,description,created_at) VALUES (?,?,?,?,?)');
          arr.forEach(it => {
            insert.run(it.title, it.image, it.price, it.description, Date.now());
          });
          insert.finalize();
          console.log('Seeded products from products.json');
        } catch (e) {
          console.warn('Failed to seed products from products.json:', e.message);
        }
      }
    }
  });
} catch (e) {
  console.warn('Product seed skipped:', e.message);
}

// Ensure numeric price_value column exists and migrate values where possible
try {
  db.serialize(() => {
    db.all("PRAGMA table_info(products)", (err, cols) => {
      if (err) return console.warn('Failed to inspect products table:', err.message);
      const hasPriceValue = Array.isArray(cols) && cols.some(c => c.name === 'price_value');
      if (!hasPriceValue) {
        db.run('ALTER TABLE products ADD COLUMN price_value REAL', [], (aErr) => {
          if (aErr) return console.warn('Failed to add price_value column:', aErr.message);
          console.log('Added price_value column to products table');
          // After adding column, populate it
          migratePriceValues();
        });
      } else {
        // Column exists — ensure missing rows are migrated
        migratePriceValues();
      }
    });

    function migratePriceValues() {
      db.all('SELECT id, price FROM products WHERE price_value IS NULL OR price_value = ""', [], (err, rows) => {
        if (err) return console.warn('Failed to read products for price migration:', err.message);
        if (!rows || rows.length === 0) return;
        const conversionRate = 83; // fallback USD->INR if needed
        const update = db.prepare('UPDATE products SET price_value = ? WHERE id = ?');
        let migrated = 0;
        rows.forEach(r => {
          if (!r || !r.price) return;
          let raw = String(r.price).trim();
          let numeric = null;
          // If starts with $, convert USD to INR
          if (raw.startsWith('$')) {
            const usd = parseFloat(raw.replace(/[^0-9.\-]+/g, ''));
            if (!isNaN(usd)) numeric = Math.round(usd * conversionRate);
          } else {
            // strip non numeric except dot and minus
            const parsed = parseFloat(raw.replace(/[^0-9.\.-]+/g, ''));
            if (!isNaN(parsed)) numeric = parsed;
          }
          if (numeric !== null) {
            update.run(numeric, r.id);
            migrated++;
          }
        });
        update.finalize(() => {
          if (migrated > 0) console.log(`Migrated ${migrated} product price_value entries`);
        });
      });
    }
  });
} catch (err) {
  console.warn('Price_value migration skipped:', err.message);
}

// Ensure orders table has a status column and migrate existing rows to 'pending'
try {
  db.serialize(() => {
    db.all("PRAGMA table_info(orders)", (err, cols) => {
      if (err) return console.warn('Failed to inspect orders table:', err.message);
      const hasStatus = Array.isArray(cols) && cols.some(c => c.name === 'status');
      if (!hasStatus) {
        db.run('ALTER TABLE orders ADD COLUMN status TEXT DEFAULT "pending"', [], (aErr) => {
          if (aErr) return console.warn('Failed to add status column to orders table:', aErr.message);
          console.log('Added status column to orders table');
          // ensure existing rows have 'pending'
          db.run('UPDATE orders SET status = ? WHERE status IS NULL OR status = ""', ['pending']);
        });
      } else {
        // ensure any null/empty statuses become pending
        db.run('UPDATE orders SET status = ? WHERE status IS NULL OR status = ""', ['pending']);
      }
    });
  });
} catch (err) {
  console.warn('Orders status migration skipped:', err.message);
}

// Add updated agricultural news for October 2025
try {
    const updatedNews = [
        {
            title: "India's Wheat Production Expected to Reach Record 115 Million Tonnes in 2025-26",
            excerpt: "Agriculture Ministry reports that favourable weather conditions and improved farming techniques are set to boost wheat production to an all-time high, benefiting millions of farmers across northern India.",
            link: "https://pib.gov.in/",
            date: "04 Oct 2025"
        },
        {
            title: "PM-KISAN 18th Installment Released: ₹2,000 Credited to 9.5 Crore Farmers",
            excerpt: "The government has successfully disbursed the 18th installment of PM-KISAN, transferring ₹19,000 crore directly to farmers' accounts. Check your payment status on pmkisan.gov.in.",
            link: "https://pmkisan.gov.in/",
            date: "02 Oct 2025"
        },
        {
            title: "New Organic Farming Scheme Launched with 50% Subsidy on Bio-Fertilizers",
            excerpt: "The Ministry of Agriculture introduces a comprehensive organic farming initiative offering 50% subsidy on bio-fertilizers, vermicompost, and organic pesticides to promote sustainable agriculture.",
            link: "https://agricoop.nic.in/",
            date: "30 Sep 2025"
        },
        {
            title: "Kharif Harvest 2025: Rice Production Up 8% Despite Delayed Monsoon",
            excerpt: "Despite initial concerns over delayed monsoon, farmers across India have reported an 8% increase in rice production this Kharif season, with Punjab and Haryana leading the growth.",
            link: "https://agricoop.nic.in/",
            date: "28 Sep 2025"
        },
        {
            title: "Government Announces ₹10,000 Crore Fund for Micro-Irrigation Projects",
            excerpt: "A new fund aims to expand drip and sprinkler irrigation coverage to 5 million hectares by 2026, helping farmers save water and increase crop yields by up to 40%.",
            link: "https://pmksy.gov.in/",
            date: "25 Sep 2025"
        },
        {
            title: "MSP for Rabi Crops 2025-26 Announced: Wheat at ₹2,425/Quintal",
            excerpt: "The Cabinet Committee on Economic Affairs has approved increased Minimum Support Prices for Rabi crops. Wheat MSP raised to ₹2,425/quintal, benefiting 30 million wheat farmers.",
            link: "https://pib.gov.in/",
            date: "22 Sep 2025"
        },
        {
            title: "Digital Agriculture: 50 Lakh Farmers Now Using AI-Powered Crop Advisory Apps",
            excerpt: "Government's digital agriculture mission sees massive adoption, with 5 million farmers using AI-based apps for real-time crop advisory, weather forecasting, and pest management.",
            link: "https://mkisan.gov.in/",
            date: "20 Sep 2025"
        },
        {
            title: "Cotton Farmers Rejoice as Prices Touch ₹8,500/Quintal in Spot Markets",
            excerpt: "Strong global demand and quality produce push cotton prices above MSP levels, giving significant profit margins to cotton farmers in Gujarat, Maharashtra, and Telangana.",
            link: "https://enam.gov.in/",
            date: "18 Sep 2025"
        },
        {
            title: "Drone Technology in Agriculture: Government Subsidizes 10,000 Agri-Drones",
            excerpt: "Under the new Kisan Drone Scheme, farmers can now purchase agricultural drones at 50% subsidy for precision farming, pesticide spraying, and crop health monitoring.",
            link: "https://agricoop.nic.in/",
            date: "15 Sep 2025"
        },
        {
            title: "Record Onion Export: India Ships 2.5 Million Tonnes, Earning $800 Million",
            excerpt: "Indian onion exports reach record levels in 2025, with major shipments to Bangladesh, Malaysia, UAE, and Sri Lanka, providing premium prices to onion growers.",
            link: "https://apeda.gov.in/",
            date: "12 Sep 2025"
        },
        {
            title: "New Crop Insurance Rules: 90% Claims Settled Within 30 Days",
            excerpt: "PMFBY introduces faster claim settlement process using satellite imagery and AI, ensuring quicker financial assistance to farmers affected by natural calamities.",
            link: "https://pmfby.gov.in/",
            date: "10 Sep 2025"
        },
        {
            title: "Solar Pumps for All: 5 Lakh Farmers to Get Free Solar Irrigation Pumps",
            excerpt: "PM-KUSUM scheme Phase III launches with target to provide 5 lakh solar irrigation pumps free of cost to small and marginal farmers, reducing electricity dependency.",
            link: "https://mnre.gov.in/",
            date: "08 Sep 2025"
        }
    ];
    
    const insertNews = db.prepare('INSERT OR REPLACE INTO news (title, excerpt, link, date, created_at) VALUES (?,?,?,?,?)');
    updatedNews.forEach(newsItem => {
        insertNews.run(
            newsItem.title,
            newsItem.excerpt,
            newsItem.link,
            newsItem.date,
            Date.now()
        );
    });
    insertNews.finalize();
    console.log(`Successfully added ${updatedNews.length} updated news articles for October 2025.`);
    
    // Also try to migrate old news.json if exists
    const NEWS_FILE = path.join(__dirname, 'news.json');
    if (fs.existsSync(NEWS_FILE)) {
        const raw = fs.readFileSync(NEWS_FILE, 'utf8');
        const arr = JSON.parse(raw || '[]');
        const insert = db.prepare('INSERT OR IGNORE INTO news (title, excerpt, link, date, created_at) VALUES (?,?,?,?,?)');
        arr.forEach(it => {
            insert.run(it.title, it.excerpt, it.link, it.date, Date.now());
        });
        insert.finalize();
        console.log('Also migrated existing news.json to database.');
    }
} catch (err) {
    console.warn('News update/migration failed:', err.message);
}

// One-time migration to convert prices from USD to INR
try {
    db.all('SELECT id, price FROM products', [], (err, rows) => {
        if (err) {
            console.error('Failed to read products for currency conversion:', err);
            return;
        }

        const conversionRate = 83; // Approximate rate 1 USD = 83 INR
        const updateStmt = db.prepare('UPDATE products SET price = ? WHERE id = ?');
        let convertedCount = 0;

        rows.forEach(row => {
            // Check if price is in USD format (e.g., "$25.00")
            if (typeof row.price === 'string' && row.price.startsWith('$')) {
                const priceInUSD = parseFloat(row.price.replace('$', ''));
                if (!isNaN(priceInUSD)) {
                    const priceInINR = Math.round(priceInUSD * conversionRate);
                    updateStmt.run(`₹${priceInINR}`, row.id);
                    convertedCount++;
                }
            }
        });

        updateStmt.finalize((err) => {
            if (err) {
                console.error('Failed to finalize price update:', err);
            } else if (convertedCount > 0) {
                console.log(`Successfully converted prices for ${convertedCount} products to INR.`);
            }
        });
    });
} catch (err) {
    console.warn('Currency conversion skipped or failed:', err.message);
}


// migrate existing products.json into SQLite (one-time)
try {
  if (fs.existsSync(PRODUCTS_FILE)) {
    const raw = fs.readFileSync(PRODUCTS_FILE, 'utf8');
    const arr = JSON.parse(raw || '[]');
    const insert = db.prepare('INSERT OR IGNORE INTO products (id,title,image,price,description,created_at) VALUES (?,?,?,?,?,?)');
    arr.forEach(it => {
      insert.run(it.id || Date.now(), it.title, it.image, it.price, it.description, it.id || Date.now());
    });
    insert.finalize();
    // keep products.json as backup but you may delete it
  }
} catch (err) {
  console.warn('Products migration skipped or failed:', err.message);
}

function readProducts(cb) {
  db.all('SELECT id,title,image,price,description,created_at FROM products ORDER BY created_at DESC', (err, rows) => {
    if (err) return cb(err, []);
    cb(null, rows);
  });
}

function readNews(cb) {
    db.all('SELECT * FROM news ORDER BY created_at DESC', (err, rows) => {
        if (err) return cb(err, []);
        cb(null, rows);
    });
}

function createProduct(item, cb) {
  const created = Date.now();
  const stmt = db.prepare('INSERT INTO products (title,image,price,description,created_at) VALUES (?,?,?,?,?)');
  stmt.run(item.title, item.image, item.price, item.description, created, function (err) {
    if (err) return cb(err);
    // return the inserted product with id
    cb(null, { id: this.lastID, title: item.title, image: item.image, price: item.price, description: item.description, created_at: created });
  });
  stmt.finalize();
}

app.get('/api/products', (req, res) => {
  readProducts((err, rows) => {
    if (err) {
        console.error("Error reading products from database:", err);
        return res.status(500).json({ error: 'Failed to retrieve products' });
    }
    // Ensure price_value is present on each product object (null-safe)
    const out = rows.map(r => ({ ...r, price_value: r.price_value == null ? null : Number(r.price_value) }));
    res.json(out);
  });
});

// Get single product by id (public)
app.get('/api/products/:id', (req, res) => {
  const id = Number(req.params.id);
  db.get('SELECT id,title,image,price,description,created_at FROM products WHERE id = ?', [id], (err, row) => {
    if (err) return res.status(500).json({ error: 'Failed to retrieve product' });
    if (!row) return res.status(404).json({ error: 'Product not found' });
    res.json(row);
  });
});

app.get('/api/news', (req, res) => {
    readNews((err, rows) => {
        if (err) {
            console.error("Error reading news from database:", err);
            return res.status(500).json({ error: 'Failed to retrieve news' });
        }
        res.json(rows);
    });
});

// Serve the main page at root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'farm.html'));
});

app.post('/api/contact', (req, res) => {
  const { name, email, message } = req.body;
  const received = Date.now();

  // Basic validation
  if (!name || !email || !message) {
    return res.status(400).json({ status: 'error', message: 'All fields are required.' });
  }

  const stmt = db.prepare('INSERT INTO contacts (name, email, message, received_at) VALUES (?, ?, ?, ?)');
  stmt.run(name, email, message, received, function (err) {
    if (err) {
      console.error('Error saving contact message:', err);
      return res.status(500).json({ status: 'error', message: 'Could not save message.' });
    }
    
    const payload = { id: this.lastID, name, email, message, received_at: received };
    // Also broadcast to any connected admins
    io.emit('contact:received', payload);
    res.json({ status: 'ok' });
  });
  stmt.finalize();
});

// Note: X-Admin-Password header fallback removed. Use /api/admin/login to create an admin session.

// upload endpoint for admin image uploads
app.post('/api/upload', requireAdmin, upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  const publicPath = '/uploads/' + path.basename(req.file.path);
  res.json({ status: 'ok', path: publicPath });
});

// Protected products POST: require admin session
app.post('/api/products', requireAdmin, (req, res) => {
  const newItem = req.body;
  createProduct(newItem, (err, created) => {
    if (err) return res.status(500).json({ status: 'error' });
    // emit updated list
    readProducts((err2, rows) => {
      if (!err2) io.emit('products:update', rows);
    });
    res.json({ status: 'ok', item: created });
  });
});

// Update product (admin)
app.put('/api/products/:id', requireAdmin, (req, res) => {
  const id = Number(req.params.id);
  const { title, image, price, description } = req.body;
  db.run('UPDATE products SET title=?, image=?, price=?, description=? WHERE id=?', [title, image, price, description, id], function (err) {
    if (err) return res.status(500).json({ status: 'error' });
    // emit updated list
    readProducts((err2, rows) => {
      if (!err2) io.emit('products:update', rows);
    });
    res.json({ status: 'ok' });
  });
});

// Delete product (admin)
app.delete('/api/products/:id', requireAdmin, (req, res) => {
  const id = Number(req.params.id);
  db.run('DELETE FROM products WHERE id=?', [id], function (err) {
    if (err) return res.status(500).json({ status: 'error' });
    // emit updated list
    readProducts((err2, rows) => {
      if (!err2) io.emit('products:update', rows);
    });
    res.json({ status: 'ok' });
  });
});

// Get all contact messages (admin)
app.get('/api/contacts', requireAdmin, (req, res) => {
  db.all('SELECT id, name, email, message, received_at FROM contacts ORDER BY received_at DESC', (err, rows) => {
    if (err) {
      console.error('Error fetching contacts:', err);
      return res.status(500).json([]);
    }
    res.json(rows);
  });
});

// Admin login endpoint (creates session)
app.post('/api/admin/login', loginLimiter, (req, res) => {
  const { password } = req.body || {};
  if (!password) return res.status(401).json({ status: 'error' });
  // compare using bcrypt
  bcrypt.compare(password, ADMIN_PASSWORD_HASH, (err, match) => {
    if (err) {
      console.error('Error comparing admin password:', err.message);
      return res.status(500).json({ status: 'error' });
    }
    if (match) {
      req.session.isAdmin = true;
      return res.json({ status: 'ok' });
    }
    return res.status(401).json({ status: 'error' });
  });
});

app.post('/api/admin/logout', (req, res) => {
  req.session.destroy(() => res.json({ status: 'ok' }));
});

// Admin status endpoint
app.get('/api/admin/status', (req, res) => {
  res.json({ isAdmin: !!req.session.isAdmin });
});

app.post('/api/checkout', checkoutLimiter, (req, res) => {
  const { customerName, customerAddress, customerPhone, items } = req.body;

  if (!customerName || !customerAddress || !customerPhone || !items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Missing required order information.' });
  }

  // Recalculate total server-side using product price_value where available
  const ids = items.map(i => Number(i.id));
  if (ids.length === 0) return res.status(400).json({ error: 'No items in order.' });

  // Fetch product prices
  const placeholders = ids.map(() => '?').join(',');
  db.all(`SELECT id, price, price_value FROM products WHERE id IN (${placeholders})`, ids, (err, rows) => {
    if (err) {
      console.error('Failed to fetch product prices for checkout:', err);
      return res.status(500).json({ error: 'Failed to calculate order total.' });
    }

    // build a map of id -> numeric price
    const priceMap = {};
    rows.forEach(r => {
      let val = null;
      if (r.price_value != null && r.price_value !== '') val = Number(r.price_value);
      if (val == null && r.price) {
        const parsed = parseFloat(String(r.price).replace(/[^0-9.\-]+/g, ''));
        if (!isNaN(parsed)) val = parsed;
      }
      priceMap[r.id] = val || 0;
    });

    // compute total
    let computedTotal = 0;
    const detailedItems = [];
    items.forEach(it => {
      const pid = Number(it.id);
      const qty = Math.max(1, Number(it.qty || 1));
      const unit = priceMap[pid] || 0;
      computedTotal += unit * qty;
      detailedItems.push({ id: pid, title: it.title || '', qty, unit_price: unit });
    });

    const totalFormatted = `₹${computedTotal.toFixed(2)}`;
    const itemsJson = JSON.stringify(detailedItems);
    const orderDate = Date.now();

    const stmt = db.prepare('INSERT INTO orders (customer_name, customer_address, customer_phone, items, total_price, order_date) VALUES (?, ?, ?, ?, ?, ?)');
    stmt.run(customerName, customerAddress, customerPhone, itemsJson, totalFormatted, orderDate, function(err) {
      if (err) {
        console.error('Error saving order to database:', err);
        return res.status(500).json({ error: 'Failed to save order.' });
      }
      // Ensure the new order has a status of 'pending' (if column exists)
      db.run('UPDATE orders SET status = ? WHERE id = ?', ['pending', this.lastID], (stErr) => {
        if (stErr) console.warn('Could not set status on new order:', stErr.message);
        const payload = { id: this.lastID, customerName, customerAddress, customerPhone, items: detailedItems, total: totalFormatted, orderDate, status: 'pending' };
        io.emit('orders:new', payload);
        // notify admin via email (if configured)
        notifyAdminOfNewOrder(payload).catch(() => {});
      });
      res.json({ status: 'ok', orderId: this.lastID });
    });
    stmt.finalize();
  });
});

// Admin: get all orders
app.get('/api/orders', requireAdmin, (req, res) => {
  db.all('SELECT id, customer_name, customer_address, customer_phone, items, total_price, order_date, status FROM orders ORDER BY order_date DESC', (err, rows) => {
    if (err) {
      console.error('Error fetching orders:', err);
      return res.status(500).json([]);
    }
    res.json(rows);
  });
});

// Admin: import products from products.json (non-destructive)
app.post('/api/admin/import-products', requireAdmin, (req, res) => {
  try {
    if (!fs.existsSync(PRODUCTS_FILE)) return res.status(404).json({ status: 'error', message: 'products.json not found' });
    const raw = fs.readFileSync(PRODUCTS_FILE, 'utf8');
    const arr = JSON.parse(raw || '[]');
    if (!Array.isArray(arr) || arr.length === 0) return res.json({ status: 'ok', added: 0, message: 'No products to import' });

    // Idempotent import: insert new products, update existing when fields differ
    let processed = 0;
    let added = 0;
    let updated = 0;

    const insertStmt = db.prepare('INSERT INTO products (id,title,image,price,description,price_value,created_at) VALUES (?,?,?,?,?,?,?)');
    const updateStmt = db.prepare('UPDATE products SET title=?, image=?, price=?, description=?, price_value=? WHERE id=?');

    const parsePriceValue = (price) => {
      if (price == null) return null;
      const s = String(price).trim();
      if (s.length === 0) return null;
      // if starts with $, treat as USD -> INR conversion (fallback)
      if (s.startsWith('$')) {
        const usd = parseFloat(s.replace(/[^0-9.\-]+/g, ''));
        if (isNaN(usd)) return null;
        const conversion = process.env.USD_TO_INR ? Number(process.env.USD_TO_INR) : 83;
        return Math.round(usd * conversion);
      }
      const num = parseFloat(s.replace(/[^0-9.\.-]+/g, ''));
      if (isNaN(num)) return null;
      return Math.round(num);
    };

    arr.forEach(p => {
      const desired = {
        id: p.id ? Number(p.id) : null,
        title: p.title || '',
        image: p.image || '',
        price: p.price || '',
        description: p.description || ''
      };

      // Find existing by id (if provided) or by title
      const findQuery = desired.id ? 'SELECT * FROM products WHERE id = ? OR title = ?' : 'SELECT * FROM products WHERE title = ?';
      const findParams = desired.id ? [desired.id, desired.title] : [desired.title];

      db.get(findQuery, findParams, (err, row) => {
        if (err) {
          console.error('Import lookup error:', err.message);
        }

        if (!row) {
          // Insert new product (preserve provided id when safe)
          try {
            const createdAt = Date.now();
            const priceVal = parsePriceValue(desired.price);
            insertStmt.run(desired.id || null, desired.title, desired.image, desired.price, desired.description, priceVal, createdAt, function (iErr) {
              if (!iErr) added++;
              processed++;
              if (processed === arr.length) finishImport();
            });
          } catch (e) {
            console.error('Insert failed for product', desired.title, e.message);
            processed++;
            if (processed === arr.length) finishImport();
          }
        } else {
          // Compare and update if changed
          const needUpdate = (row.title !== desired.title) || (row.image !== desired.image) || (row.price !== desired.price) || (row.description !== desired.description);
          if (needUpdate) {
            const priceVal = parsePriceValue(desired.price);
            updateStmt.run(desired.title, desired.image, desired.price, desired.description, priceVal, row.id, function (uErr) {
              if (!uErr) updated++;
              processed++;
              if (processed === arr.length) finishImport();
            });
          } else {
            // nothing to do
            processed++;
            if (processed === arr.length) finishImport();
          }
        }
      });
    });

    const finishImport = () => {
      insertStmt.finalize(() => {
        updateStmt.finalize(() => {
          // broadcast updated products list
          readProducts((rErr, rows) => {
            if (!rErr) io.emit('products:update', rows);
            return res.json({ status: 'ok', added, updated });
          });
        });
      });
    };
  } catch (err) {
    console.error('Failed to import products:', err.message);
    return res.status(500).json({ status: 'error', message: 'Import failed' });
  }
});

// Admin: update order status
app.put('/api/orders/:id/status', requireAdmin, (req, res) => {
  const id = Number(req.params.id);
  const { status } = req.body || {};
  const allowed = ['pending','processing','packed','shipped','delivered','cancelled'];
  if (!status || !allowed.includes(status)) return res.status(400).json({ status: 'error', message: 'Invalid status' });
  db.run('UPDATE orders SET status = ? WHERE id = ?', [status, id], function(err) {
    if (err) return res.status(500).json({ status: 'error', message: 'Failed to update status' });
    // fetch updated order
    db.get('SELECT id, customer_name, customer_address, customer_phone, items, total_price, order_date, status FROM orders WHERE id = ?', [id], (e, row) => {
      if (e) return res.status(500).json({ status: 'error', message: 'Failed to retrieve order' });
        io.emit('orders:update', row);
        // notify admin email if configured
        notifyAdminOfStatusChange(row).catch(() => {});
        res.json({ status: 'ok', order: row });
    });
  });
});

io.on('connection', (socket) => {
  console.log('client connected', socket.id);
  // send current products
  readProducts((err, rows) => {
    if (!err) socket.emit('products:update', rows);
  });

  // send current news
  readNews((err, rows) => {
    if (!err) socket.emit('news:update', rows);
  });

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });

  // --- Enhanced Agricultural Chatbot Logic ---
  socket.on('chat message', (msg) => {
    console.log('Received chat message:', msg);
    const lowerCaseMessage = msg.toLowerCase();
    let botReply = "I'm your farming assistant! 🌾 I can help with: fertilizers, pest control, crop prices, planting seasons, soil health, irrigation, and government schemes. What would you like to know?";

    // Fertilizer queries
    if (lowerCaseMessage.includes('fertilizer') && (lowerCaseMessage.includes('wheat') || lowerCaseMessage.includes('gehun'))) {
        botReply = "🌾 For wheat cultivation, I recommend:\n• Basal dose: 60 kg Urea + 50 kg DAP per acre\n• Top dressing: 40 kg Urea after first irrigation (21 days)\n• Use NPK 12:32:16 for better results\n• Apply zinc sulphate if soil is deficient\n📍 Best time: At sowing and after first irrigation";
    } else if (lowerCaseMessage.includes('fertilizer') && (lowerCaseMessage.includes('rice') || lowerCaseMessage.includes('dhan') || lowerCaseMessage.includes('paddy'))) {
        botReply = "🌱 For rice/paddy cultivation:\n• Basal: 50 kg DAP + 25 kg Urea per acre\n• 1st top dressing: 50 kg Urea at tillering (21 days)\n• 2nd top dressing: 25 kg Urea at panicle initiation (45 days)\n• Use potash (MOP) 15-20 kg for better grain filling\n💧 Apply in standing water for best results";
    } else if (lowerCaseMessage.includes('fertilizer') && (lowerCaseMessage.includes('vegetable') || lowerCaseMessage.includes('sabzi'))) {
        botReply = "🥬 For vegetables:\n• Use organic compost (5-10 tons/acre) before planting\n• NPK 19:19:19 at 10 kg per acre every 15 days\n• Foliar spray with micronutrients for better quality\n• Use vermicompost for chemical-free farming";
    } else if (lowerCaseMessage.includes('fertilizer') && (lowerCaseMessage.includes('cotton') || lowerCaseMessage.includes('kapas'))) {
        botReply = "🧶 For cotton cultivation:\n• Basal: 50 kg DAP + 25 kg MOP per acre\n• Top dressing: 50 kg Urea at 30-40 days\n• Foliar spray: 19:19:19 at flowering\n• Apply boron for better boll formation";
    } else if (lowerCaseMessage.includes('fertilizer') || lowerCaseMessage.includes('khad')) {
        botReply = "🌾 General fertilizer guidelines:\n• NPK ratio depends on crop & soil type\n• Get soil tested before application (₹50-200)\n• Organic: Compost, vermicompost, FYM\n• Chemical: Urea, DAP, MOP, NPK complexes\n💡 Which crop are you growing? Tell me for specific advice!";
    }

    // Pest control
    else if (lowerCaseMessage.includes('pest') && lowerCaseMessage.includes('organic')) {
        botReply = "🐛 Organic pest control methods:\n• Neem oil spray (5ml/liter water) - weekly\n• Garlic-chili spray - natural repellent\n• Bacillus thuringiensis (BT) - for caterpillars\n• Yellow sticky traps - for whiteflies\n• Encourage natural predators (ladybugs, spiders)\n🌿 Safe for environment & humans!";
    } else if (lowerCaseMessage.includes('pest') || lowerCaseMessage.includes('insect') || lowerCaseMessage.includes('keet')) {
        botReply = "🐜 Common pest solutions:\n• Aphids: Dimethoate 30% EC @ 2ml/liter\n• Whitefly: Imidacloprid 17.8% SL @ 0.5ml/liter\n• Bollworm: Chlorpyriphos @ 2.5ml/liter\n• Stem borer: Cartap hydrochloride 50% SP\n⚠️ Always wear protective gear & follow label instructions";
    }

    // Crop prices
    else if (lowerCaseMessage.includes('price') || lowerCaseMessage.includes('mandi') || lowerCaseMessage.includes('bhav')) {
        botReply = "💰 Today's approximate mandi prices (MSP 2024-25):\n• Wheat: ₹2,275/quintal\n• Rice (Paddy): ₹2,300/quintal\n• Cotton: ₹7,020/quintal\n• Maize: ₹2,090/quintal\n• Sugarcane: ₹340/quintal\n📊 Prices vary by region. Check your local mandi or use eNAM app for real-time prices!";
    }

    // Planting seasons
    else if (lowerCaseMessage.includes('season') && lowerCaseMessage.includes('rice')) {
        botReply = "🌱 Rice planting seasons in India:\n• Kharif (Main): June-July (harvest Oct-Nov)\n• Rabi: Nov-Dec (harvest Mar-Apr) - limited regions\n• Summer: Jan-Feb (harvest Apr-May) - with irrigation\n🌧️ Kharif is best with monsoon rains!";
    } else if (lowerCaseMessage.includes('season') && lowerCaseMessage.includes('wheat')) {
        botReply = "🌾 Wheat planting season:\n• Best time: October-November\n• Harvest: March-April\n• Temperature: 10-15°C for sowing\n• Requires: 4-5 irrigations during growth\n❄️ Rabi (winter) crop - needs cool climate";
    } else if (lowerCaseMessage.includes('season') || lowerCaseMessage.includes('plant') || lowerCaseMessage.includes('sowing')) {
        botReply = "📅 Indian crop seasons:\n🌧️ Kharif (Monsoon): June-Oct\n   Rice, Cotton, Soybean, Groundnut\n❄️ Rabi (Winter): Oct-Mar\n   Wheat, Mustard, Chickpea, Barley\n☀️ Zaid (Summer): Mar-Jun\n   Vegetables, Watermelon, Cucumber\nTell me your crop for specific dates!";
    }

    // Soil health
    else if (lowerCaseMessage.includes('soil') && (lowerCaseMessage.includes('improve') || lowerCaseMessage.includes('health') || lowerCaseMessage.includes('fertility'))) {
        botReply = "🌍 Improve soil health:\n• Add organic matter: Compost, FYM, green manure\n• Crop rotation: Prevents nutrient depletion\n• Cover crops: Legumes add nitrogen\n• Reduce tillage: Preserves soil structure\n• Balance pH: Use lime (acidic) or gypsum (alkaline)\n• Soil testing: Every 2-3 years (₹50-200)\n🔬 Healthy soil = Healthy crops!";
    }

    // Water management
    else if (lowerCaseMessage.includes('water') || lowerCaseMessage.includes('irrigation') || lowerCaseMessage.includes('drip')) {
        botReply = "💧 Water management tips:\n• Drip irrigation: Saves 30-50% water\n• Mulching: Reduces evaporation\n• Sprinkler: Good for vegetables\n• Alternate wetting-drying (AWD): For rice, saves 25% water\n• Rainwater harvesting: Farm ponds, check dams\n💰 Govt subsidy available (40-55%) for micro-irrigation!";
    }

    // Government schemes
    else if (lowerCaseMessage.includes('scheme') || lowerCaseMessage.includes('subsidy') || lowerCaseMessage.includes('yojana') || lowerCaseMessage.includes('government')) {
        botReply = "🏛️ Major agricultural schemes:\n• PM-KISAN: ₹6,000/year to all farmers\n• Soil Health Card: Free soil testing\n• Kisan Credit Card (KCC): Low-interest loans\n• PMFBY: Crop insurance at 2% premium\n• Micro-irrigation subsidy: 40-55%\n• PM Fasal Bima Yojana: Comprehensive crop insurance\n📱 Visit pmkisan.gov.in or nearby CSC center";
    }

    // Weather
    else if (lowerCaseMessage.includes('weather') || lowerCaseMessage.includes('rain') || lowerCaseMessage.includes('forecast')) {
        botReply = "🌤️ For accurate weather forecasts:\n• IMD AgroMet: agromet.imd.gov.in\n• Meghdoot App: 7-day forecast + advisory\n• Damini App: Lightning warnings\n• Kisan Suvidha App: All-in-one info\n☔ Always check before spraying pesticides!";
    }

    // Greetings
    else if (lowerCaseMessage.includes('hello') || lowerCaseMessage.includes('hi') || lowerCaseMessage.includes('namaste') || lowerCaseMessage.includes('hey')) {
        botReply = "🙏 Namaste! I'm your farming assistant 🌾\n\nI can help you with:\n• Fertilizer recommendations\n• Pest & disease control\n• Crop prices & market info\n• Best planting seasons\n• Soil health improvement\n• Water management\n• Government schemes\n\nWhat would you like to know?";
    }

    // Thank you
    else if (lowerCaseMessage.includes('thank') || lowerCaseMessage.includes('dhanyavaad') || lowerCaseMessage.includes('shukriya')) {
        botReply = "🙏 You're welcome! Happy farming! 🌾 Feel free to ask anytime. Jai Jawan Jai Kisan! 💚";
    }
    
    // Send response back to the same user
    socket.emit('chat message', botReply);
  });
});

const PORT = process.env.PORT || 3000;
if (require.main === module) {
  server.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
}

// Export for tests
module.exports = { app, server, db };
