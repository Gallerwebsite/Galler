/**
 * Media storage facade.
 * Prefer ImageKit when configured; otherwise local disk.
 */
const path = require('path');
const imagekitUtil = require('./imagekit');

function provider() {
  if (imagekitUtil.isConfigured()) return 'imagekit';
  return 'local';
}

function isConfigured() {
  return provider() !== 'local';
}

function isManagedUrl(url) {
  return imagekitUtil.isImageKitUrl(url);
}

async function uploadMedia(buffer, originalName, options = {}) {
  if (!isConfigured()) {
    throw new Error('ImageKit is not configured');
  }
  return imagekitUtil.uploadMedia(buffer, originalName, options);
}

async function uploadFromPath(filePath, originalName, options = {}) {
  if (!isConfigured()) {
    throw new Error('ImageKit is not configured');
  }
  return imagekitUtil.uploadFromPath(filePath, originalName, options);
}

async function uploadResume(buffer, originalName) {
  if (!isConfigured()) {
    throw new Error('ImageKit is not configured');
  }
  return imagekitUtil.uploadResume(buffer, originalName);
}

async function removeLocalFile(filePath) {
  return imagekitUtil.removeLocalFile(filePath);
}

async function deleteByUrl(url) {
  if (imagekitUtil.isImageKitUrl(url)) {
    if (!imagekitUtil.isConfigured()) {
      throw new Error('ImageKit is not configured');
    }
    return imagekitUtil.deleteByUrl(url);
  }
  return false;
}

async function fetchManagedFile(url) {
  if (imagekitUtil.isImageKitUrl(url)) {
    return imagekitUtil.fetchImageKitFile(url);
  }
  throw new Error('Unsupported media URL');
}

function isLocalUploadPath(url) {
  return typeof url === 'string' && url.startsWith('/uploads/');
}

module.exports = {
  provider,
  isConfigured,
  isManagedUrl,
  isImageKitUrl: imagekitUtil.isImageKitUrl,
  isLocalUploadPath,
  uploadMedia,
  uploadFromPath,
  uploadResume,
  removeLocalFile,
  deleteByUrl,
  fetchManagedFile,
  path,
};
