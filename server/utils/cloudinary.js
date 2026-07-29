const fs = require('fs');
const crypto = require('crypto');
const path = require('path');
const cloudinary = require('cloudinary').v2;

function isConfigured() {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
  );
}

function configure() {
  if (!isConfigured()) return false;

  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });

  return true;
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

function buildUploadOptions(originalName, { folder = 'galler/uploads', resourceType = 'auto' } = {}) {
  const uniqueFilename = buildUniqueFilename(originalName);
  const ext = path.extname(originalName).toLowerCase();
  const basePublicId = uniqueFilename.replace(/\.[^/.]+$/, '');
  const publicId = resourceType === 'raw' && ext ? `${basePublicId}${ext}` : basePublicId;

  return {
    folder,
    public_id: publicId,
    resource_type: resourceType,
    use_filename: false,
    unique_filename: false,
  };
}

function uploadBuffer(buffer, options = {}) {
  configure();

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(options, (error, result) => {
      if (error) reject(error);
      else resolve(result);
    });
    stream.end(buffer);
  });
}

function uploadLocalFile(filePath, options = {}) {
  configure();

  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(filePath, options, (error, result) => {
      if (error) reject(error);
      else resolve(result);
    });
  });
}

function isCloudinaryUrl(url) {
  return typeof url === 'string' && url.includes('res.cloudinary.com');
}

function getResourceTypeFromUrl(url) {
  const match = url.match(/res\.cloudinary\.com\/[^/]+\/([^/]+)\/upload\//);
  return match?.[1] || 'image';
}

function getPublicIdFromUrl(url) {
  const uploadIndex = url.indexOf('/upload/');
  if (uploadIndex === -1) return null;

  let publicIdWithExt = url.slice(uploadIndex + '/upload/'.length);
  if (publicIdWithExt.startsWith('v')) {
    publicIdWithExt = publicIdWithExt.replace(/^v\d+\//, '');
  }

  const queryIndex = publicIdWithExt.indexOf('?');
  if (queryIndex !== -1) {
    publicIdWithExt = publicIdWithExt.slice(0, queryIndex);
  }

  return publicIdWithExt.replace(/\.[^/.]+$/, '');
}

function getDeliveryPublicIdFromUrl(url, fileName = '') {
  const uploadIndex = url.indexOf('/upload/');
  if (uploadIndex === -1) return null;

  let publicId = url.slice(uploadIndex + '/upload/'.length);
  if (publicId.startsWith('v')) {
    publicId = publicId.replace(/^v\d+\//, '');
  }

  const queryIndex = publicId.indexOf('?');
  if (queryIndex !== -1) {
    publicId = publicId.slice(0, queryIndex);
  }

  const urlExt = path.extname(publicId);
  const fileExt = path.extname(fileName).toLowerCase();
  if (!urlExt && fileExt) {
    publicId = `${publicId}${fileExt}`;
  }

  return publicId;
}

function ensureDocumentExtension(url, fileName = '') {
  if (!url || typeof url !== 'string') return url;

  const ext = path.extname(fileName).toLowerCase();
  if (!ext) return url;

  const [baseUrl, query = ''] = url.split('?');
  if (baseUrl.toLowerCase().endsWith(ext)) {
    return url;
  }

  return query ? `${baseUrl}${ext}?${query}` : `${baseUrl}${ext}`;
}

function getAuthenticatedDownloadUrl(publicId, resourceType = 'raw') {
  configure();

  return cloudinary.utils.private_download_url(publicId, '', {
    resource_type: resourceType,
    type: 'upload',
    expires_at: Math.floor(Date.now() / 1000) + 3600,
  });
}

async function fetchCloudinaryFile(url, fileName = '') {
  const resourceType = getResourceTypeFromUrl(url);
  const publicId = getDeliveryPublicIdFromUrl(url, fileName);

  if (!publicId) {
    throw new Error('Invalid Cloudinary URL');
  }

  if (isConfigured()) {
    const candidates = [publicId];
    const fileExt = path.extname(fileName).toLowerCase();
    const urlExt = path.extname(publicId).toLowerCase();

    if (fileExt && urlExt !== fileExt) {
      candidates.push(`${publicId.replace(/\.[^/.]+$/, '')}${fileExt}`);
    }
    if (urlExt) {
      candidates.push(publicId.replace(/\.[^/.]+$/, ''));
    }

    for (const candidate of [...new Set(candidates)]) {
      try {
        const downloadUrl = getAuthenticatedDownloadUrl(candidate, resourceType);
        const response = await fetch(downloadUrl);
        if (response.ok) {
          return {
            buffer: Buffer.from(await response.arrayBuffer()),
            resolvedUrl: downloadUrl,
          };
        }
      } catch {
        // try next candidate
      }
    }
  }

  const directCandidates = [ensureDocumentExtension(url, fileName), url];
  for (const candidate of [...new Set(directCandidates)]) {
    const response = await fetch(candidate);
    if (response.ok) {
      return {
        buffer: Buffer.from(await response.arrayBuffer()),
        resolvedUrl: candidate,
      };
    }
  }

  throw new Error('Failed to fetch Cloudinary file');
}

async function deleteByUrl(url) {
  if (!isCloudinaryUrl(url)) return false;

  configure();
  const publicId = getPublicIdFromUrl(url);
  if (!publicId) {
    throw new Error('Invalid Cloudinary URL');
  }

  const resourceType = getResourceTypeFromUrl(url);
  await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
  return true;
}

async function uploadMedia(buffer, originalName, { folder = 'galler/uploads', resourceType = 'auto' } = {}) {
  return uploadBuffer(buffer, buildUploadOptions(originalName, { folder, resourceType }));
}

async function uploadFromPath(filePath, originalName, { folder = 'galler/uploads', resourceType = 'auto' } = {}) {
  await fs.promises.access(filePath, fs.constants.R_OK);
  return uploadLocalFile(filePath, buildUploadOptions(originalName, { folder, resourceType }));
}

async function uploadResume(buffer, originalName) {
  return uploadBuffer(
    buffer,
    buildUploadOptions(originalName, { folder: 'galler/resumes', resourceType: 'raw' })
  );
}

async function removeLocalFile(filePath) {
  if (!filePath) return;
  await fs.promises.unlink(filePath).catch(() => {});
}

module.exports = {
  isConfigured,
  configure,
  uploadBuffer,
  uploadMedia,
  uploadFromPath,
  uploadResume,
  uploadLocalFile,
  removeLocalFile,
  isCloudinaryUrl,
  deleteByUrl,
  getPublicIdFromUrl,
  getDeliveryPublicIdFromUrl,
  getAuthenticatedDownloadUrl,
  fetchCloudinaryFile,
  ensureDocumentExtension,
};
