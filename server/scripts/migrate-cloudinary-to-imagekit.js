/**
 * Migrate Cloudinary assets referenced in the TEST MongoDB to ImageKit,
 * then rewrite those URLs in-place so pages keep the same content/placements.
 *
 * Safety: only runs against a database whose name contains "imagekit-test".
 * Production (galler) is never written to.
 *
 * Usage (from server/):
 *   npm run migrate-imagekit
 *
 * Requires in server/.env:
 *   MONGODB_URI → galler-imagekit-test
 *   IMAGEKIT_PUBLIC_KEY / IMAGEKIT_PRIVATE_KEY / IMAGEKIT_URL_ENDPOINT
 *
 * Cloudinary API keys are optional if delivery URLs are publicly fetchable.
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
      // Capture full URL tokens (may appear inside longer strings rarely)
      const matches = value.match(/https?:\/\/res\.cloudinary\.com\/[^\s"'\\]+/g);
      if (matches) {
        for (const m of matches) {
          found.add(m.replace(/[,.;)]+$/, ''));
        }
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
    for (const key of Object.keys(value)) {
      collectCloudinaryUrls(value[key], found);
    }
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
  if (Array.isArray(value)) {
    return value.map((item) => rewriteUrls(item, urlMap));
  }
  if (value && typeof value === 'object') {
    const out = Array.isArray(value) ? [] : { ...value };
    for (const key of Object.keys(value)) {
      out[key] = rewriteUrls(value[key], urlMap);
    }
    return out;
  }
  return value;
}

function folderAndNameFromCloudinaryUrl(url) {
  try {
    const { pathname } = new URL(url);
    // /<cloud>/image|video|raw/upload/v123/folder/name.ext
    const uploadIdx = pathname.indexOf('/upload/');
    let rest = uploadIdx === -1 ? pathname : pathname.slice(uploadIdx + '/upload/'.length);
    rest = rest.replace(/^v\d+\//, '');
    const parts = rest.split('/').filter(Boolean);
    const fileName = parts.pop() || `file-${Date.now()}`;
    const folder = parts.length ? `galler/${parts.join('/')}` : 'galler/uploads';
    // Normalize to galler/uploads or galler/resumes when path already has galler/...
    const normalizedFolder = folder.startsWith('galler/') ? folder : `galler/uploads/${folder}`;
    return { folder: normalizedFolder.replace(/\/$/, ''), fileName: decodeURIComponent(fileName) };
  } catch {
    return { folder: 'galler/uploads', fileName: `file-${Date.now()}` };
  }
}

async function downloadCloudinary(url) {
  // Prefer authenticated download when Cloudinary is configured (covers private/raw)
  if (cloudinaryUtil.isConfigured()) {
    try {
      const fetched = await cloudinaryUtil.fetchCloudinaryFile(url);
      return fetched.buffer;
    } catch {
      // fall through to public fetch
    }
  }

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
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
  const mongoUri = process.env.MONGODB_URI_TARGET || process.env.MONGODB_URI;
  if (!mongoUri) {
    console.error('Set MONGODB_URI (or MONGODB_URI_TARGET) to galler-imagekit-test');
    process.exit(1);
  }

  const dbName = dbNameFromUri(mongoUri);
  if (!/imagekit-test/i.test(dbName)) {
    console.error(
      `Refusing to migrate: database "${dbName}" is not a test DB.\n` +
        `Expected name containing "imagekit-test". Production will not be modified.`
    );
    process.exit(1);
  }

  if (!imagekitUtil.isConfigured()) {
    console.error('ImageKit env vars missing (PUBLIC/PRIVATE/URL_ENDPOINT)');
    process.exit(1);
  }

  console.log('\nCloudinary → ImageKit migration');
  console.log(`  Target DB: ${dbName}`);
  console.log(`  ImageKit:  ${process.env.IMAGEKIT_URL_ENDPOINT}`);
  console.log(`  Cloudinary API: ${cloudinaryUtil.isConfigured() ? 'yes' : 'no (public URL fetch)'}\n`);

  const conn = await mongoose.createConnection(mongoUri).asPromise();
  const Store = conn.model('Store', storeSchema);
  const docs = await Store.find({}).lean();

  const allUrls = new Set();
  for (const doc of docs) {
    collectCloudinaryUrls(doc.data, allUrls);
  }

  const urls = [...allUrls];
  console.log(`Found ${urls.length} unique Cloudinary URL(s) in Store data.\n`);

  if (!urls.length) {
    console.log('Nothing to migrate.');
    await conn.close();
    return;
  }

  let urlMap = {};
  if (fs.existsSync(MAP_PATH)) {
    try {
      urlMap = JSON.parse(fs.readFileSync(MAP_PATH, 'utf8'));
      console.log(`Loaded existing map with ${Object.keys(urlMap).length} entries.\n`);
    } catch {
      urlMap = {};
    }
  }

  let ok = 0;
  let skipped = 0;
  let failed = 0;
  const failures = [];

  for (let i = 0; i < urls.length; i++) {
    const url = urls[i];
    const label = `[${i + 1}/${urls.length}]`;

    if (urlMap[url]) {
      console.log(`${label} skip (already mapped)`);
      skipped += 1;
      continue;
    }

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
      failures.push({ url, error: String(err.message || err) });
    }
  }

  console.log(`\nUpload summary: ${ok} new, ${skipped} skipped, ${failed} failed`);

  if (Object.keys(urlMap).length === 0) {
    console.error('No successful mappings; aborting DB rewrite.');
    await conn.close();
    process.exit(1);
  }

  console.log('\nRewriting URLs in test DB…');
  let rewrittenDocs = 0;
  for (const doc of docs) {
    const nextData = rewriteUrls(doc.data, urlMap);
    const before = JSON.stringify(doc.data);
    const after = JSON.stringify(nextData);
    if (before === after) continue;

    await Store.findOneAndUpdate({ key: doc.key }, { data: nextData });
    console.log(`  ✓ ${doc.key}`);
    rewrittenDocs += 1;
  }

  // Remaining cloudinary refs?
  const afterDocs = await Store.find({}).lean();
  const remaining = new Set();
  for (const doc of afterDocs) collectCloudinaryUrls(doc.data, remaining);

  await conn.close();

  console.log(`\nRewrote ${rewrittenDocs} document(s).`);
  console.log(`Map saved: ${MAP_PATH}`);
  if (remaining.size) {
    console.log(`\nWARNING: ${remaining.size} Cloudinary URL(s) still present (failed uploads or unmatched).`);
    for (const u of remaining) console.log(`  - ${u}`);
  } else {
    console.log('\nAll Cloudinary URLs in the test DB now point at ImageKit.');
  }
  console.log('\nProduction DB was not modified. Compare localhost vs gallerindia.com.\n');

  if (failures.length) {
    console.log('Failures:');
    for (const f of failures) console.log(`  ${f.error} :: ${f.url}`);
  }
}

main().catch((err) => {
  console.error('Migration failed:', err.message || err);
  process.exit(1);
});
