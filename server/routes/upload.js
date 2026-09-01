const express = require('express');
const multer = require('multer');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { body, validationResult } = require('express-validator');
const authMiddleware = require('../middleware/auth');
const mediaStorage = require('../utils/mediaStorage');

const router = express.Router();

const uploadsDir = path.join(__dirname, '..', 'uploads');

const diskStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

const tempDiskStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, os.tmpdir());
  },
  filename: (_req, file, cb) => {
    const safeName = path.basename(file.originalname).replace(/[^a-zA-Z0-9._-]/g, '_');
    cb(null, `galler-${Date.now()}-${safeName}`);
  },
});

const memoryStorage = multer.memoryStorage();

const imageFilter = (_req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed (jpeg, png, gif, webp, svg)'), false);
  }
};

const videoFilter = (_req, file, cb) => {
  const allowedTypes = ['video/mp4', 'video/webm', 'video/quicktime'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only video files are allowed (mp4, webm, mov)'), false);
  }
};

const documentFilter = (_req, file, cb) => {
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/zip',
    'model/gltf-binary',
    'model/gltf+json',
    'application/octet-stream',
    'application/zip',
    'application/x-zip-compressed',
  ];
  const allowedExtensions = ['.pdf', '.doc', '.docx', '.glb', '.gltf', '.obj', '.stl', '.step', '.stp', '.zip'];
  const ext = path.extname(file.originalname).toLowerCase();

  if (allowedTypes.includes(file.mimetype) || allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Only document and 3D model files are allowed (pdf, doc, docx, glb, gltf, obj, stl, step, stp, zip)'), false);
  }
};

const MAX_IMAGE_SIZE = 10 * 1024 * 1024;
const MAX_DOCUMENT_SIZE = 100 * 1024 * 1024;

function getImageStorage() {
  return mediaStorage.isConfigured() ? memoryStorage : diskStorage;
}

function getLargeFileStorage() {
  return mediaStorage.isConfigured() ? tempDiskStorage : diskStorage;
}

const uploadImage = multer({
  storage: getImageStorage(),
  fileFilter: imageFilter,
  limits: { fileSize: MAX_IMAGE_SIZE },
});

const uploadVideo = multer({
  storage: getLargeFileStorage(),
  fileFilter: videoFilter,
  limits: { fileSize: 100 * 1024 * 1024 },
});

const uploadDocument = multer({
  storage: getLargeFileStorage(),
  fileFilter: documentFilter,
  limits: { fileSize: MAX_DOCUMENT_SIZE },
});

async function resolveUploadedFile(file, resourceType = 'auto') {
  if (mediaStorage.isConfigured()) {
    const uploadOptions = {
      folder: 'galler/uploads',
      resourceType,
    };

    if (file.path) {
      try {
        const result = await mediaStorage.uploadFromPath(
          file.path,
          file.originalname,
          uploadOptions
        );
        return {
          url: result.secure_url || result.url,
          fileName: file.originalname,
        };
      } finally {
        await mediaStorage.removeLocalFile(file.path);
      }
    }

    if (file.buffer) {
      const result = await mediaStorage.uploadMedia(file.buffer, file.originalname, uploadOptions);
      return {
        url: result.secure_url || result.url,
        fileName: file.originalname,
      };
    }

    throw new Error('Uploaded file data is missing');
  }

  return {
    url: `/uploads/${file.filename}`,
    fileName: file.originalname,
  };
}

function handleUpload(multerMiddleware, { fieldName, resourceType = 'auto' } = {}) {
  return (req, res) => {
    multerMiddleware.single(fieldName)(req, res, async (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          const maxSize = fieldName === 'image' ? '10MB' : '100MB';
          return res.status(400).json({ message: `File too large. Max size is ${maxSize}.` });
        }
        return res.status(400).json({ message: err.message });
      }
      if (err) {
        return res.status(400).json({ message: err.message || 'Upload failed' });
      }
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      try {
        const uploaded = await resolveUploadedFile(req.file, resourceType);
        res.json({
          message: 'File uploaded successfully',
          url: uploaded.url,
          fileName: uploaded.fileName,
        });
      } catch (uploadErr) {
        console.error('Media upload failed:', uploadErr.message || uploadErr);
        res.status(500).json({ message: 'Upload failed. Please try again.' });
      }
    });
  };
}

router.post('/', authMiddleware, handleUpload(uploadImage, { fieldName: 'image', resourceType: 'image' }));
router.post('/video', authMiddleware, handleUpload(uploadVideo, { fieldName: 'video', resourceType: 'video' }));
router.post('/document', authMiddleware, handleUpload(uploadDocument, { fieldName: 'file', resourceType: 'raw' }));

router.delete(
  '/',
  authMiddleware,
  [
    body('url')
      .notEmpty()
      .withMessage('URL is required')
      .isString()
      .withMessage('URL must be a string')
      .trim()
      .custom((value) => {
        if (value.startsWith('/uploads/')) return true;
        if (mediaStorage.isImageKitUrl(value)) return true;
        throw new Error('Invalid file URL format');
      }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Invalid URL provided',
        errors: errors.array(),
      });
    }

    const { url } = req.body;

    try {
      if (mediaStorage.isManagedUrl(url)) {
        const deleted = await mediaStorage.deleteByUrl(url);
        console.log(
          `Media delete ${deleted ? 'ok' : 'skipped'}: imagekit`,
          url.slice(0, 120)
        );
        return res.json({ message: 'File deleted successfully' });
      }

      if (!url.startsWith('/uploads/')) {
        return res.status(400).json({ message: 'Only uploaded files can be deleted' });
      }

      const filename = path.basename(url);
      if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
        return res.status(400).json({ message: 'Invalid filename' });
      }

      const filePath = path.join(uploadsDir, filename);
      if (!filePath.startsWith(uploadsDir)) {
        return res.status(400).json({ message: 'Invalid file path' });
      }

      await fs.promises.unlink(filePath).catch((unlinkErr) => {
        if (unlinkErr.code !== 'ENOENT') throw unlinkErr;
      });

      return res.json({ message: 'File deleted successfully' });
    } catch (deleteErr) {
      console.error('Delete failed:', deleteErr.message || deleteErr);
      return res.status(500).json({ message: 'Failed to delete file' });
    }
  }
);

module.exports = router;
