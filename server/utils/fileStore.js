const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '..', 'data');

function readJSON(filename) {
  const filePath = path.join(dataDir, filename);
  if (!fs.existsSync(filePath)) {
    return null;
  }
  const raw = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(raw);
}

function writeJSON(filename, data) {
  const filePath = path.join(dataDir, filename);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

function exists(filename) {
  return fs.existsSync(path.join(dataDir, filename));
}

module.exports = { readJSON, writeJSON, exists };
