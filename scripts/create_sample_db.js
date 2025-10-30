// scripts/create_sample_db.js
// Copies data/data.db to data/sample-data.db for safe submission/demo use.
// Usage: node scripts/create_sample_db.js

const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..');
const dataDir = path.join(repoRoot, 'data');
const src = path.join(dataDir, 'data.db');
const dest = path.join(dataDir, 'sample-data.db');

try {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
    console.log('Created data/ directory');
  }

  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
    console.log(`Copied ${src} -> ${dest}`);
  } else {
    // create an empty placeholder file so repo contains a sample DB file slot
    fs.writeFileSync(dest, '');
    console.log(`${src} not found — created empty placeholder ${dest}.`);
    console.log('If you want seeded data, run the server once to seed from products.json or replace sample-data.db with a real DB.');
  }
} catch (err) {
  console.error('Error creating sample DB:', err);
  process.exit(1);
}
