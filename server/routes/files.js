const express = require('express');
const fs = require('fs');
const path = require('path');
const mediaStorage = require('../utils/mediaStorage');

const router = express.Router();

const uploadsDir = path.join(__dirname, '..', 'uploads');

const CONTENT_TYPES = {
  '.pdf': 'application/pdf',
  '.doc': 'application/msword',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '.glb': 'model/gltf-binary',
  '.gltf': 'model/gltf+json',
  '.obj': 'text/plain',
  '.stl': 'model/stl',
  '.step': 'application/step',
  '.stp': 'application/step',
  '.zip': 'application/zip',
};

function resolveDownloadFileName(fileName, url, fallback = 'download') {
  const baseName = (fileName || '').trim() || fallback;
  if (path.extname(baseName)) return baseName;

  const urlBase = (url || '').split('?')[0];
  const urlExt = path.extname(urlBase);
  if (urlExt) return `${baseName}${urlExt}`;

  return baseName;
}

function sanitizeFilename(fileName) {
  const base = path.basename(fileName || 'download').replace(/[^a-zA-Z0-9._-]/g, '_');
  return base || 'download';
}

function getContentType(fileName, fallbackUrl = '') {
  const ext = path.extname(fileName || fallbackUrl).toLowerCase();
  return CONTENT_TYPES[ext] || 'application/octet-stream';
}

function isAllowedDownloadUrl(url) {
  if (typeof url !== 'string' || !url.trim()) return false;

  if (url.startsWith('/uploads/')) {
    const filename = path.basename(url);
    return Boolean(filename) && !filename.includes('..');
  }

  if (mediaStorage.isImageKitUrl(url)) {
    const endpoint = (process.env.IMAGEKIT_URL_ENDPOINT || '').replace(/\/$/, '');
    if (endpoint && url.startsWith(endpoint)) return true;
    return url.includes('ik.imagekit.io');
  }

  if (!mediaStorage.isCloudinaryUrl(url)) return false;

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  if (cloudName && !url.includes(`res.cloudinary.com/${cloudName}/`)) {
    return false;
  }

  return true;
}

async function readLocalUpload(relativeUrl) {
  const filename = path.basename(relativeUrl);
  const filePath = path.join(uploadsDir, filename);

  if (!filePath.startsWith(uploadsDir)) {
    throw new Error('Invalid file path');
  }

  return fs.promises.readFile(filePath);
}

router.get('/download', async (req, res) => {
  const url = typeof req.query.url === 'string' ? req.query.url.trim() : '';
  const fileName = typeof req.query.filename === 'string' ? req.query.filename.trim() : '';
  const disposition = req.query.disposition === 'inline' ? 'inline' : 'attachment';

  if (!isAllowedDownloadUrl(url)) {
    return res.status(400).json({ message: 'Invalid file URL' });
  }

  try {
    let fileBuffer;
    let resolvedUrl = url;
    const resolvedFileName = resolveDownloadFileName(fileName, url);

    if (url.startsWith('/uploads/')) {
      fileBuffer = await readLocalUpload(url);
    } else {
      const fetched = await mediaStorage.fetchManagedFile(url, resolvedFileName);
      fileBuffer = fetched.buffer;
      resolvedUrl = fetched.resolvedUrl;
    }

    const safeName = sanitizeFilename(resolvedFileName || path.basename(url));
    res.setHeader('Content-Type', getContentType(safeName, resolvedUrl));
    res.setHeader('Content-Disposition', `${disposition}; filename="${safeName}"`);
    res.setHeader('Access-Control-Allow-Origin', process.env.FRONTEND_URL || '*');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    return res.send(fileBuffer);
  } catch (err) {
    console.error('File download failed:', err.message || err);
    return res.status(500).json({ message: 'Failed to download file' });
  }
});

module.exports = router;
