/**
 * Media storage facade.
 * Prefer ImageKit when configured (local ImageKit testing / future prod).
 * Fall back to Cloudinary, then local disk uploads.
 */
const path = require('path');
const cloudinaryUtil = require('./cloudinary');
const imagekitUtil = require('./imagekit');

function provider() {
  if (imagekitUtil.isConfigured()) return 'imagekit';
  if (cloudinaryUtil.isConfigured()) return 'cloudinary';
  return 'local';
}

function isConfigured() {
  return provider() !== 'local';
}

function isManagedUrl(url) {
  return cloudinaryUtil.isCloudinaryUrl(url) || imagekitUtil.isImageKitUrl(url);
}

async function uploadMedia(buffer, originalName, options = {}) {
  if (provider() === 'imagekit') {
    return imagekitUtil.uploadMedia(buffer, originalName, options);
  }
  return cloudinaryUtil.uploadMedia(buffer, originalName, options);
}

async function uploadFromPath(filePath, originalName, options = {}) {
  if (provider() === 'imagekit') {
    return imagekitUtil.uploadFromPath(filePath, originalName, options);
  }
  return cloudinaryUtil.uploadFromPath(filePath, originalName, options);
}

async function uploadResume(buffer, originalName) {
  if (provider() === 'imagekit') {
    return imagekitUtil.uploadResume(buffer, originalName);
  }
  return cloudinaryUtil.uploadResume(buffer, originalName);
}

async function removeLocalFile(filePath) {
  if (provider() === 'imagekit') {
    return imagekitUtil.removeLocalFile(filePath);
  }
  return cloudinaryUtil.removeLocalFile(filePath);
}

async function deleteByUrl(url) {
  if (imagekitUtil.isImageKitUrl(url)) {
    if (!imagekitUtil.isConfigured()) {
      throw new Error('ImageKit is not configured');
    }
    return imagekitUtil.deleteByUrl(url);
  }
  if (cloudinaryUtil.isCloudinaryUrl(url)) {
    return cloudinaryUtil.deleteByUrl(url);
  }
  return false;
}

async function fetchManagedFile(url, fileName = '') {
  if (imagekitUtil.isImageKitUrl(url)) {
    return imagekitUtil.fetchImageKitFile(url);
  }
  if (cloudinaryUtil.isCloudinaryUrl(url)) {
    return cloudinaryUtil.fetchCloudinaryFile(url, fileName);
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
  isCloudinaryUrl: cloudinaryUtil.isCloudinaryUrl,
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
