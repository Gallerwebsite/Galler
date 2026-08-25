const crypto = require('crypto');
const path = require('path');
const fs = require('fs');
const ImageKit = require('imagekit');

let client = null;

function isConfigured() {
  return Boolean(
    process.env.IMAGEKIT_PUBLIC_KEY &&
      process.env.IMAGEKIT_PRIVATE_KEY &&
      process.env.IMAGEKIT_URL_ENDPOINT
  );
}

function getClient() {
  if (!isConfigured()) {
    throw new Error('ImageKit is not configured');
  }
  if (!client) {
    client = new ImageKit({
      publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
      privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
      urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT.replace(/\/$/, ''),
    });
  }
  return client;
}

function isImageKitUrl(url) {
  if (typeof url !== 'string') return false;
  return url.includes('ik.imagekit.io') || url.includes('imagekit.io');
}

function buildUniqueFilename(originalName, prefix = 'file') {
  const ext = path.extname(originalName).toLowerCase();
  const safeBase = path
    .basename(originalName, ext)
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .slice(0, 40);
  const unique = `${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
  return `${prefix}-${safeBase || 'upload'}-${unique}${ext}`;
}

function folderForResource(resourceType = 'auto') {
  if (resourceType === 'raw' || resourceType === 'document') return 'galler/uploads';
  return 'galler/uploads';
}

async function uploadBuffer(buffer, originalName, { folder = 'galler/uploads' } = {}) {
  const imagekit = getClient();
  const fileName = buildUniqueFilename(originalName);
  const result = await imagekit.upload({
    file: buffer,
    fileName,
    folder,
    useUniqueFileName: false,
  });
  return {
    secure_url: result.url,
    url: result.url,
    fileId: result.fileId,
    name: result.name,
    filePath: result.filePath,
  };
}

async function uploadMedia(buffer, originalName, { folder = 'galler/uploads', resourceType = 'auto' } = {}) {
  return uploadBuffer(buffer, originalName, {
    folder: folder || folderForResource(resourceType),
  });
}

async function uploadFromPath(filePath, originalName, options = {}) {
  const buffer = await fs.promises.readFile(filePath);
  return uploadMedia(buffer, originalName || path.basename(filePath), options);
}

async function uploadResume(buffer, originalName) {
  return uploadBuffer(buffer, originalName, { folder: 'galler/resumes' });
}

async function removeLocalFile(filePath) {
  if (!filePath) return;
  await fs.promises.unlink(filePath).catch(() => {});
}

function getFilePathFromUrl(url) {
  const endpoint = (process.env.IMAGEKIT_URL_ENDPOINT || '').replace(/\/$/, '');
  if (endpoint && url.startsWith(endpoint)) {
    return url.slice(endpoint.length) || '/';
  }
  try {
    const { pathname } = new URL(url);
    const parts = pathname.split('/').filter(Boolean);
    // /{imagekitId}/path/to/file → drop imagekit id
    if (parts.length >= 2) return `/${parts.slice(1).join('/')}`;
    return pathname;
  } catch {
    return null;
  }
}

async function deleteByUrl(url) {
  if (!isImageKitUrl(url)) return false;

  const imagekit = getClient();
  const filePath = getFilePathFromUrl(url);
  const fileName = filePath ? path.basename(filePath) : path.basename(url.split('?')[0]);

  const listed = await imagekit.listFiles({
    searchQuery: `name="${fileName}"`,
    limit: 20,
  });

  const matches = (listed || []).filter((file) => {
    if (file.url === url) return true;
    if (filePath && file.filePath === filePath) return true;
    return false;
  });

  const target = matches[0] || listed?.[0];
  if (!target?.fileId) {
    throw new Error('ImageKit file not found for delete');
  }

  await imagekit.deleteFile(target.fileId);
  return true;
}

async function fetchImageKitFile(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch ImageKit file (${response.status})`);
  }
  return {
    buffer: Buffer.from(await response.arrayBuffer()),
    resolvedUrl: url,
  };
}

module.exports = {
  isConfigured,
  isImageKitUrl,
  uploadBuffer,
  uploadMedia,
  uploadFromPath,
  uploadResume,
  removeLocalFile,
  deleteByUrl,
  fetchImageKitFile,
  getFilePathFromUrl,
  getClient,
};
