require('dotenv').config();

const fs = require('fs');
const path = require('path');
const { connectDB } = require('../db/connect');
const { readJSON, writeJSON, exists } = require('../utils/fileStore');
const Store = require('../models/Store');
const cloudinaryUtil = require('../utils/cloudinary');

const dataDir = path.join(__dirname, '..', 'data');
const uploadsDir = path.join(__dirname, '..', 'uploads');

const JSON_FILES = [
  'content.json',
  'admin.json',
  'careers-jobs.json',
  'contact-submissions.json',
  'project-submissions.json',
  'work-with-us-submissions.json',
  'resume-submissions.json',
  'job-applications.json',
  'newsletter-subscribers.json',
  'newsletter-campaigns.json',
];

async function migrateJsonToMongo() {
  console.log('\nMigrating JSON files to MongoDB...');

  for (const filename of JSON_FILES) {
    const filePath = path.join(dataDir, filename);
    if (!fs.existsSync(filePath)) {
      console.log(`  skip ${filename} (not found)`);
      continue;
    }

    const data = readJSON(filename);
    if (data === null) {
      console.log(`  skip ${filename} (empty)`);
      continue;
    }

    const alreadyExists = await Store.findOne({ key: filename }).select('_id');
    if (alreadyExists) {
      console.log(`  skip ${filename} (already in MongoDB)`);
      continue;
    }

    await Store.findOneAndUpdate({ key: filename }, { data }, { upsert: true, returnDocument: 'after' });
    console.log(`  ✓ ${filename}`);
  }
}

async function migrateUploadsToCloudinary() {
  if (!cloudinaryUtil.isConfigured()) {
    console.log('\nSkipping upload migration (Cloudinary not configured).');
    return;
  }

  if (!fs.existsSync(uploadsDir)) {
    console.log('\nNo local uploads folder to migrate.');
    return;
  }

  const files = fs.readdirSync(uploadsDir).filter((name) => name !== '.gitkeep');
  if (files.length === 0) {
    console.log('\nNo local uploads to migrate.');
    return;
  }

  console.log(`\nMigrating ${files.length} upload(s) to Cloudinary...`);
  const urlMap = {};

  for (const filename of files) {
    const filePath = path.join(uploadsDir, filename);
    const ext = path.extname(filename).toLowerCase();
    const isVideo = ['.mp4', '.webm', '.mov'].includes(ext);
    const isRaw = ['.pdf', '.doc', '.docx', '.glb', '.gltf', '.obj', '.stl', '.step', '.stp', '.zip'].includes(ext);

    try {
      const result = await cloudinaryUtil.uploadFromPath(filePath, filename, {
        folder: 'galler/uploads',
        resourceType: isVideo ? 'video' : isRaw ? 'raw' : 'image',
      });

      urlMap[`/uploads/${filename}`] = result.secure_url;
      console.log(`  ✓ ${filename}`);
    } catch (err) {
      console.log(`  ✗ ${filename} (${err.message || 'upload failed'})`);
    }
  }

  if (Object.keys(urlMap).length === 0) {
    console.log('  No uploads migrated.');
    return;
  }

  const contentDoc = await Store.findOne({ key: 'content.json' });
  if (contentDoc) {
    let contentStr = JSON.stringify(contentDoc.data);
    for (const [oldUrl, newUrl] of Object.entries(urlMap)) {
      contentStr = contentStr.split(oldUrl).join(newUrl);
    }
    contentDoc.data = JSON.parse(contentStr);
    await contentDoc.save();
    console.log('  ✓ Updated content.json URLs in MongoDB');
  } else {
    const contentPath = path.join(dataDir, 'content.json');
    if (fs.existsSync(contentPath)) {
      let contentStr = fs.readFileSync(contentPath, 'utf-8');
      for (const [oldUrl, newUrl] of Object.entries(urlMap)) {
        contentStr = contentStr.split(oldUrl).join(newUrl);
      }
      writeJSON('content.json', JSON.parse(contentStr));
      console.log('  ✓ Updated content.json URLs on disk');
    }
  }
}

async function main() {
  if (!process.env.MONGODB_URI) {
    console.error('Set MONGODB_URI before running migration.');
    process.exit(1);
  }

  await connectDB();
  await migrateJsonToMongo();
  await migrateUploadsToCloudinary();
  console.log('\nMigration complete.\n');
  process.exit(0);
}

main().catch((err) => {
  console.error('Migration failed:', err.message || err);
  process.exit(1);
});
