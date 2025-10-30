// Generate responsive images for files in /uploads and write a manifest to data/image-manifest.json
const fs = require('fs').promises;
const path = require('path');
const sharp = require('sharp');

const ROOT = path.resolve(__dirname, '..');
const UPLOADS = path.join(ROOT, 'uploads');
const DATA_DIR = path.join(ROOT, 'data');
const MANIFEST = path.join(DATA_DIR, 'image-manifest.json');

const SIZES = [480, 768, 1024, 1600];
const JPEG_QUALITY = 80;

async function ensureDir(dir) {
  try { await fs.mkdir(dir, { recursive: true }); } catch (e) { }
}

function isImage(filename) {
  return /\.(jpe?g|png|webp)$/i.test(filename);
}

async function processFile(file) {
  const full = path.join(UPLOADS, file);
  const ext = path.extname(file).toLowerCase();
  const base = path.basename(file, ext);

  const outputs = [];
  for (const w of SIZES) {
    const outJpg = `${base}-${w}.jpg`;
    const outWebp = `${base}-${w}.webp`;
    const outJpgPath = path.join(UPLOADS, outJpg);
    const outWebpPath = path.join(UPLOADS, outWebp);

    try {
      // create jpeg
      await sharp(full)
        .resize({ width: w, withoutEnlargement: true })
        .jpeg({ quality: JPEG_QUALITY, mozjpeg: true })
        .toFile(outJpgPath);
      // create webp
      await sharp(full)
        .resize({ width: w, withoutEnlargement: true })
        .webp({ quality: 80 })
        .toFile(outWebpPath);

      outputs.push({ width: w, jpg: `uploads/${outJpg}`, webp: `uploads/${outWebp}` });
    } catch (err) {
      console.error('Failed to create resized image for', file, w, err.message);
    }
  }
  return outputs;
}

async function main() {
  console.log('Scanning uploads folder for images...');
  await ensureDir(DATA_DIR);
  let files;
  try {
    files = await fs.readdir(UPLOADS);
  } catch (err) {
    console.error('Could not read uploads directory:', err.message);
    process.exit(1);
  }

  const manifest = {};

  for (const f of files) {
    if (!isImage(f)) continue;
    // skip already generated -{w} files
    if (/-\d+\.(jpe?g|webp)$/i.test(f)) continue;
    try {
      const outs = await processFile(f);
      if (outs.length) manifest[f] = outs;
    } catch (err) {
      console.error('Error processing', f, err.message);
    }
  }

  try {
    await fs.writeFile(MANIFEST, JSON.stringify(manifest, null, 2), 'utf8');
    console.log('Wrote manifest to', MANIFEST);
  } catch (err) {
    console.error('Failed to write manifest:', err.message);
  }
}

main().catch(err => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
