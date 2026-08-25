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

function normalizeMediaUrl(url) {
  try {
    const parsed = new URL(url);
    parsed.search = '';
    parsed.hash = '';
    return parsed.toString().replace(/\/$/, '');
  } catch {
    return String(url || '').split('?')[0].split('#')[0];
  }
}

function getFilePathFromUrl(url) {
  const cleanUrl = normalizeMediaUrl(url);
  const endpoint = (process.env.IMAGEKIT_URL_ENDPOINT || '').replace(/\/$/, '');
  let pathname = '';

  if (endpoint && cleanUrl.startsWith(endpoint)) {
    pathname = cleanUrl.slice(endpoint.length) || '/';
  } else {
    try {
      const parts = new URL(cleanUrl).pathname.split('/').filter(Boolean);
      // /{imagekitId}/path/to/file → drop imagekit id
      pathname = parts.length >= 2 ? `/${parts.slice(1).join('/')}` : `/${parts.join('/')}`;
    } catch {
      return null;
    }
  }

  try {
    pathname = decodeURIComponent(pathname);
  } catch {
    // keep encoded path if decode fails
  }

  if (!pathname.startsWith('/')) pathname = `/${pathname}`;
  return pathname || null;
}

function pathsMatch(a, b) {
  if (!a || !b) return false;
  const left = a.startsWith('/') ? a : `/${a}`;
  const right = b.startsWith('/') ? b : `/${b}`;
  return left === right;
}

async function findImageKitFile(url) {
  const imagekit = getClient();
  const cleanUrl = normalizeMediaUrl(url);
  const filePath = getFilePathFromUrl(cleanUrl);
  const fileName = filePath ? path.posix.basename(filePath) : path.basename(cleanUrl);
  const folder = filePath ? path.posix.dirname(filePath).replace(/^\//, '') : '';

  const pickMatch = (listed) => {
    const files = listed || [];
    return (
      files.find((file) => normalizeMediaUrl(file.url || '') === cleanUrl) ||
      files.find((file) => pathsMatch(file.filePath, filePath)) ||
      files.find((file) => file.name === fileName && pathsMatch(file.filePath, filePath)) ||
      null
    );
  };

  // 1) Prefer folder-scoped lookup (most accurate for nested galler/uploads paths)
  if (folder && folder !== '.') {
    const inFolder = await imagekit.listFiles({
      path: folder,
      searchQuery: `name="${fileName}"`,
      limit: 20,
    });
    const match = pickMatch(inFolder);
    if (match?.fileId) return match;
  }

  // 2) Global name search
  const byName = await imagekit.listFiles({
    searchQuery: `name="${fileName}"`,
    limit: 50,
  });
  const nameMatch = pickMatch(byName);
  if (nameMatch?.fileId) return nameMatch;

  // 3) Last resort: same folder listing without searchQuery
  if (folder && folder !== '.') {
    const folderFiles = await imagekit.listFiles({
      path: folder,
      limit: 100,
    });
    const folderMatch = pickMatch(folderFiles);
    if (folderMatch?.fileId) return folderMatch;
  }

  return null;
}

async function deleteByUrl(url) {
  if (!isImageKitUrl(url)) return false;

  const target = await findImageKitFile(url);
  // Already gone from ImageKit — treat as success so CMS clear still works
  if (!target?.fileId) {
    return true;
  }

  await getClient().deleteFile(target.fileId);
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
