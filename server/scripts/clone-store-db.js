/**
 * Clone Galler CMS Store documents from production MongoDB into a TEST database.
 *
 * Safety:
 * - Never writes to the source URI
 * - Refuses to run if source and target are the same database
 * - Use only for ImageKit comparison (prod stays on Cloudinary URLs)
 *
 * Usage (from server/):
 *   MONGODB_URI_SOURCE="mongodb+srv://.../galler" \
 *   MONGODB_URI_TARGET="mongodb+srv://.../galler-imagekit-test" \
 *   npm run clone-db
 *
 * Or set those vars in server/.env and run: npm run clone-db
 */
require('dotenv').config();

const mongoose = require('mongoose');

const storeSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true, index: true },
    data: { type: mongoose.Schema.Types.Mixed, required: true },
  },
  { timestamps: true, collection: 'stores' }
);

function dbNameFromUri(uri) {
  try {
    const pathname = new URL(uri).pathname.replace(/^\//, '');
    return pathname.split('?')[0] || '(default)';
  } catch {
    return '(unparseable)';
  }
}

function clusterHostFromUri(uri) {
  try {
    return new URL(uri).hostname;
  } catch {
    return '';
  }
}

async function main() {
  const sourceUri = process.env.MONGODB_URI_SOURCE || process.env.MONGODB_URI;
  const targetUri = process.env.MONGODB_URI_TARGET;

  if (!sourceUri || !targetUri) {
    console.error(`
Missing URIs.

Set both in server/.env (recommended):

  MONGODB_URI_SOURCE=<production Atlas connection string with /galler or your prod db name>
  MONGODB_URI_TARGET=<same cluster, but database name galler-imagekit-test>

Then run: npm run clone-db
`);
    process.exit(1);
  }

  const sourceDb = dbNameFromUri(sourceUri);
  const targetDb = dbNameFromUri(targetUri);

  if (sourceUri === targetUri || sourceDb === targetDb) {
    console.error(
      `Refusing to clone: source and target resolve to the same database ("${sourceDb}").\n` +
        `Use a different DB name on the target, e.g. .../galler-imagekit-test`
    );
    process.exit(1);
  }

  if (targetDb === 'galler' || targetDb === 'production' || /prod/i.test(targetDb)) {
    console.error(
      `Refusing to write to target database "${targetDb}".\n` +
        `Use a clearly named test DB such as galler-imagekit-test.`
    );
    process.exit(1);
  }

  console.log('\nGaller Store clone');
  console.log(`  Source: ${clusterHostFromUri(sourceUri)} / ${sourceDb}`);
  console.log(`  Target: ${clusterHostFromUri(targetUri)} / ${targetDb}`);
  console.log('  (Production will not be modified)\n');

  const sourceConn = await mongoose.createConnection(sourceUri).asPromise();
  const targetConn = await mongoose.createConnection(targetUri).asPromise();

  const SourceStore = sourceConn.model('Store', storeSchema);
  const TargetStore = targetConn.model('Store', storeSchema);

  const docs = await SourceStore.find({}).lean();
  if (!docs.length) {
    console.warn('Source has 0 Store documents. Check MONGODB_URI_SOURCE / database name.');
    await sourceConn.close();
    await targetConn.close();
    process.exit(1);
  }

  console.log(`Found ${docs.length} document(s) in source.\n`);

  let upserted = 0;
  for (const doc of docs) {
    const { key, data, createdAt, updatedAt } = doc;
    await TargetStore.findOneAndUpdate(
      { key },
      { key, data, createdAt, updatedAt },
      { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
    );
    console.log(`  ✓ ${key}`);
    upserted += 1;
  }

  await sourceConn.close();
  await targetConn.close();

  console.log(`\nDone. Copied ${upserted} document(s) into "${targetDb}".`);
  console.log('Next: point local MONGODB_URI at the TARGET URI for ImageKit testing.');
  console.log('Keep Render production on the SOURCE database.\n');
}

main().catch(async (err) => {
  console.error('Clone failed:', err.message || err);
  process.exit(1);
});
