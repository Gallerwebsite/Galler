const fileStore = require('./fileStore');
const { connectDB, getIsConnected } = require('../db/connect');

function useMongoDB() {
  return Boolean(process.env.MONGODB_URI);
}

async function ensureMongo() {
  if (!useMongoDB()) return false;
  if (getIsConnected()) return true;
  return connectDB();
}

async function readJSON(filename) {
  if (useMongoDB()) {
    await ensureMongo();
    const Store = require('../models/Store');
    const doc = await Store.findOne({ key: filename });
    return doc ? doc.data : null;
  }
  return fileStore.readJSON(filename);
}

async function writeJSON(filename, data) {
  if (useMongoDB()) {
    await ensureMongo();
    const Store = require('../models/Store');
    await Store.findOneAndUpdate({ key: filename }, { data }, { upsert: true, returnDocument: 'after' });
    return;
  }
  fileStore.writeJSON(filename, data);
}

async function exists(filename) {
  if (useMongoDB()) {
    await ensureMongo();
    const Store = require('../models/Store');
    const doc = await Store.findOne({ key: filename }).select('_id');
    return Boolean(doc);
  }
  return fileStore.exists(filename);
}

module.exports = { readJSON, writeJSON, exists, useMongoDB };
