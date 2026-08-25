/**
 * Rewrite Cloudinary URLs → ImageKit on PRODUCTION MongoDB (`galler`).
 *
 * Uses server/scripts/imagekit-url-map.json from the test migration.
 * Any remaining Cloudinary URLs (new since clone) are uploaded to ImageKit,
 * then rewritten.
 *
 * SAFETY:
 * - Requires ALLOW_PROD_REWRITE=YES
 * - Target must be MONGODB_URI_SOURCE and database name must be exactly "galler"
 * - Never writes to galler-imagekit-test
 *
 * Usage (from server/):
 *   ALLOW_PROD_REWRITE=YES npm run rewrite-prod-imagekit
 *
 * Backup production first (mongodump / Atlas snapshot).
 */
require('dotenv').config();

const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const imagekitUtil = require('../utils/imagekit');
const cloudinaryUtil = require('../utils/cloudinary');

const CLOUDINARY_HOST = 'res.cloudinary.com';
const MAP_PATH = path.join(__dirname, 'imagekit-url-map.json');

const storeSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true, index: true },
    data: { type: mongoose.Schema.Types.Mixed, required: true },
  },
  { timestamps: true, collection: 'stores' }
);

function dbNameFromUri(uri) {
  try {
    return new URL(uri).pathname.replace(/^\//, '').split('?')[0] || '';
  } catch {
    return '';
  }
}

function collectCloudinaryUrls(value, found = new Set()) {
  if (typeof value === 'string') {
    if (value.includes(CLOUDINARY_HOST)) {
      const matches = value.match(/https?:\/\/res\.cloudinary\.com\/[^\s"'\\]+/g);
      if (matches) {
        for (const m of matches) found.add(m.replace(/[,.;)]+$/, ''));
      } else if (value.startsWith('http')) {
        found.add(value);
      }
    }
    return found;
  }
  if (Array.isArray(value)) {
    for (const item of value) collectCloudinaryUrls(item, found);
    return found;
  }
  if (value && typeof value === 'object') {
    for (const key of Object.keys(value)) collectCloudinaryUrls(value[key], found);
  }
  return found;
}

function rewriteUrls(value, urlMap) {
  if (typeof value === 'string') {
    let next = value;
    for (const [from, to] of Object.entries(urlMap)) {
      if (next.includes(from)) next = next.split(from).join(to);
    }
    return next;
  }
  if (Array.isArray(value)) return value.map((item) => rewriteUrls(item, urlMap));
  if (value && typeof value === 'object') {
    const out = { ...value };
    for (const key of Object.keys(value)) out[key] = rewriteUrls(value[key], urlMap);
    return out;
  }
  return value;
}

function folderAndNameFromCloudinaryUrl(url) {
  try {
    const { pathname } = new URL(url);
    const uploadIdx = pathname.indexOf('/upload/');
    let rest = uploadIdx === -1 ? pathname : pathname.slice(uploadIdx + '/upload/'.length);
    rest = rest.replace(/^v\d+\//, '');
    const parts = rest.split('/').filter(Boolean);
    const fileName = decodeURIComponent(parts.pop() || `file-${Date.now()}`);
    const folder = parts.length ? `galler/${parts.join('/')}` : 'galler/uploads';
    const normalizedFolder = folder.startsWith('galler/') ? folder : `galler/uploads/${folder}`;
    return { folder: normalizedFolder.replace(/\/$/, ''), fileName };
  } catch {
    return { folder: 'galler/uploads', fileName: `file-${Date.now()}` };
  }
}

async function downloadCloudinary(url) {
  if (cloudinaryUtil.isConfigured()) {
    try {
      const fetched = await cloudinaryUtil.fetchCloudinaryFile(url);
      return fetched.buffer;
    } catch {
      // fall through
    }
  }
  const response = await fetch(url);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return Buffer.from(await response.arrayBuffer());
}

async function uploadToImageKit(buffer, cloudinaryUrl) {
  const { folder, fileName } = folderAndNameFromCloudinaryUrl(cloudinaryUrl);
  const imagekit = imagekitUtil.getClient();
  const result = await imagekit.upload({
    file: buffer,
    fileName,
    folder,
    useUniqueFileName: false,
  });
  return result.url;
}

async function main() {
  if (process.env.ALLOW_PROD_REWRITE !== 'YES') {
    console.error(
      'Refusing to run.\n' +
        'This rewrites PRODUCTION. After backup, run:\n' +
        '  ALLOW_PROD_REWRITE=YES npm run rewrite-prod-imagekit\n'
    );
    process.exit(1);
  }

  const mongoUri = process.env.MONGODB_URI_SOURCE;
  if (!mongoUri) {
    console.error('Set MONGODB_URI_SOURCE to the production galler connection string.');
    process.exit(1);
  }

  const dbName = dbNameFromUri(mongoUri);
  if (dbName !== 'galler') {
    console.error(
      `Refusing to rewrite: expected database name "galler", got "${dbName}".\n` +
        'Check MONGODB_URI_SOURCE.'
    );
    process.exit(1);
  }

  if (/imagekit-test/i.test(dbName) || /imagekit-test/i.test(mongoUri)) {
    console.error('Refusing: URI looks like the test database.');
    process.exit(1);
  }

  if (!imagekitUtil.isConfigured()) {
    console.error('ImageKit env vars missing.');
    process.exit(1);
  }

  if (!fs.existsSync(MAP_PATH)) {
    console.error(`Missing map file: ${MAP_PATH}`);
    process.exit(1);
  }

  let urlMap = JSON.parse(fs.readFileSync(MAP_PATH, 'utf8'));
  console.log('\nPRODUCTION rewrite: Cloudinary → ImageKit');
  console.log(`  Database: ${dbName}`);
  console.log(`  Map entries: ${Object.keys(urlMap).length}`);
  console.log(`  Cloudinary API: ${cloudinaryUtil.isConfigured() ? 'yes' : 'no'}\n`);

  const conn = await mongoose.createConnection(mongoUri).asPromise();
  const Store = conn.model('Store', storeSchema);
  const docs = await Store.find({}).lean();

  const beforeUrls = new Set();
  for (const doc of docs) collectCloudinaryUrls(doc.data, beforeUrls);
  console.log(`Cloudinary URLs in prod before rewrite: ${beforeUrls.size}`);

  // Upload any missing URLs not in the map
  const missing = [...beforeUrls].filter((u) => !urlMap[u]);
  if (missing.length) {
    console.log(`\n${missing.length} URL(s) not in map — uploading to ImageKit…\n`);
    let ok = 0;
    let failed = 0;
    for (let i = 0; i < missing.length; i++) {
      const url = missing[i];
      const label = `[${i + 1}/${missing.length}]`;
      try {
        process.stdout.write(`${label} download… `);
        const buffer = await downloadCloudinary(url);
        process.stdout.write(`upload (${Math.round(buffer.length / 1024)} KB)… `);
        const newUrl = await uploadToImageKit(buffer, url);
        urlMap[url] = newUrl;
        fs.writeFileSync(MAP_PATH, JSON.stringify(urlMap, null, 2));
        console.log('✓');
        ok += 1;
      } catch (err) {
        console.log(`✗ ${err.message || err}`);
        failed += 1;
      }
    }
    console.log(`\nExtra uploads: ${ok} ok, ${failed} failed`);
  }

  console.log('\nRewriting Store documents…');
  let rewrittenDocs = 0;
  for (const doc of docs) {
    const nextData = rewriteUrls(doc.data, urlMap);
    if (JSON.stringify(doc.data) === JSON.stringify(nextData)) continue;
    await Store.findOneAndUpdate({ key: doc.key }, { data: nextData });
    console.log(`  ✓ ${doc.key}`);
    rewrittenDocs += 1;
  }

  const afterDocs = await Store.find({}).lean();
  const remaining = new Set();
  for (const doc of afterDocs) collectCloudinaryUrls(doc.data, remaining);

  const imagekitCount = JSON.stringify(afterDocs).match(/ik\.imagekit\.io/g)?.length || 0;

  await conn.close();

  console.log(`\nRewrote ${rewrittenDocs} document(s).`);
  console.log(`ImageKit URL refs (approx): ${imagekitCount}`);
  if (remaining.size) {
    console.log(`\nWARNING: ${remaining.size} Cloudinary URL(s) still remain:`);
    for (const u of remaining) console.log(`  - ${u}`);
    process.exit(1);
  }

  console.log('\nDone. Production `galler` now points media at ImageKit.');
  console.log('Next: add ImageKit env on Render + Vercel, then deploy code.\n');
}

main().catch((err) => {
  console.error('Prod rewrite failed:', err.message || err);
  process.exit(1);
});
