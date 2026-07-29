const express = require('express');
const { body, validationResult } = require('express-validator');
const { readJSON, writeJSON } = require('../utils/dataStore');
const { decodeContentValues } = require('../utils/decodeEntities');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Validation helper
function validateContent(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      message: 'Invalid data provided',
      errors: errors.array() 
    });
  }
  next();
}

// Generic content field validators
const stringValidator = (field, maxLength = 5000) => 
  body(field)
    .optional()
    .isString().withMessage(`${field} must be a string`)
    .trim()
    .isLength({ max: maxLength }).withMessage(`${field} must be ${maxLength} characters or less`);

const urlValidator = (field) =>
  body(field)
    .optional()
    .isString().withMessage(`${field} must be a string`)
    .trim()
    .custom((value) => {
      if (value === '') return true; // Allow empty strings
      // Allow /uploads/ paths or full URLs
      if (value.startsWith('/uploads/')) return true;
      if (value.match(/^https?:\/\/.+/)) return true;
      throw new Error(`${field} must be a valid URL or /uploads/ path`);
    });

const arrayValidator = (field, maxItems = 50) =>
  body(field)
    .optional()
    .isArray().withMessage(`${field} must be an array`)
    .custom((arr) => arr.length <= maxItems)
    .withMessage(`${field} can have at most ${maxItems} items`);

router.get('/', async (req, res) => {
  const content = await readJSON('content.json');
  if (!content) {
    return res.status(500).json({ message: 'Content not found' });
  }
  res.json(decodeContentValues(content));
});

router.get('/:section', async (req, res) => {
  const content = await readJSON('content.json');
  if (!content) {
    return res.status(500).json({ message: 'Content not found' });
  }

  const section = content[req.params.section];
  if (!section) {
    return res.status(404).json({ message: `Section "${req.params.section}" not found` });
  }

  res.json(decodeContentValues(section));
});

router.put('/:section', 
  authMiddleware,
  [
    // Validate common string fields
    stringValidator('title', 200),
    stringValidator('headingLine1', 200),
    stringValidator('headingLine2', 200),
    stringValidator('heading', 200),
    stringValidator('subtitle', 500),
    stringValidator('description', 5000),
    stringValidator('tagline', 200),
    stringValidator('paragraph1', 5000),
    stringValidator('paragraph2', 5000),
    stringValidator('ctaText', 100),
    stringValidator('location', 200),
    stringValidator('name', 200),
    stringValidator('email', 200),
    stringValidator('email2', 200),
    stringValidator('phone', 50),
    stringValidator('address', 500),
    stringValidator('since', 20),
    
    // URL fields
    urlValidator('backgroundImage'),
    urlValidator('videoUrl'),
    urlValidator('image'),
    urlValidator('icon'),
    
    // Array fields
    arrayValidator('logos', 18),
    arrayValidator('items', 50),
    arrayValidator('stats', 20),
    arrayValidator('categories', 20),
    arrayValidator('members', 50),
    arrayValidator('benefits', 30),
    arrayValidator('images', 50),
    arrayValidator('steps', 20),
    arrayValidator('industries', 50),
    arrayValidator('capabilities', 50),
    arrayValidator('plants', 20),
    arrayValidator('departments', 10),
    
    // Nested object validation
    body('*.title').optional().isString().trim().isLength({ max: 200 }),
    body('*.description').optional().isString().trim().isLength({ max: 5000 }),
    body('*.name').optional().isString().trim().isLength({ max: 200 }),
    body('*.src').optional().isString().trim(),
    body('*.alt').optional().isString().trim().isLength({ max: 200 }),
    body('*.url').optional().isString().trim(),
    body('*.href').optional().isString().trim(),
    body('departments.*.title').optional().isString().trim().isLength({ max: 200 }),
    body('departments.*.description').optional().isString().trim().isLength({ max: 500 }),
    body('departments.*.email').optional().isString().trim().isLength({ max: 200 }),
    body('departments.*.icon').optional().isIn(['headset', 'gear', 'person']),
  ],
  validateContent,
  async (req, res) => {
    const content = await readJSON('content.json');
    if (!content) {
      return res.status(500).json({ message: 'Content not found' });
    }

    const { section } = req.params;

    const sanitizedBody = decodeContentValues(
      Object.fromEntries(
        Object.entries(req.body).filter(
          ([key]) => key !== '__proto__' && key !== 'constructor' && key !== 'prototype'
        )
      )
    );

    // Additional section-specific validation
    if (section === 'marquee') {
      const MARQUEE_LOGOS_PER_ROW = 15;

      const validateLogo = (logo) => {
        if (!logo.id || typeof logo.id !== 'string') {
          return 'Each logo must have a valid id.';
        }
        if (typeof logo.src !== 'string' || typeof logo.alt !== 'string') {
          return 'Logo src and alt must be strings.';
        }
        return null;
      };

      if (Array.isArray(req.body.row1) || Array.isArray(req.body.row2)) {
        const row1 = Array.isArray(req.body.row1) ? req.body.row1 : [];
        const row2 = Array.isArray(req.body.row2) ? req.body.row2 : [];

        if (row1.length > MARQUEE_LOGOS_PER_ROW || row2.length > MARQUEE_LOGOS_PER_ROW) {
          return res.status(400).json({
            message: `Each row supports up to ${MARQUEE_LOGOS_PER_ROW} logos.`,
          });
        }

        for (const logo of [...row1, ...row2]) {
          const error = validateLogo(logo);
          if (error) return res.status(400).json({ message: error });
        }

        content[section] = decodeContentValues({ row1, row2 });
        await writeJSON('content.json', content);
        return res.json({ message: `Section "${section}" updated`, data: content[section] });
      }

      if (Array.isArray(req.body.logos)) {
        const MARQUEE_MAX_LOGOS = 30;
        if (req.body.logos.length > MARQUEE_MAX_LOGOS) {
          return res.status(400).json({ message: `Marquee supports a maximum of ${MARQUEE_MAX_LOGOS} logos.` });
        }
        for (const logo of req.body.logos) {
          const error = validateLogo(logo);
          if (error) return res.status(400).json({ message: error });
          if (!logo.src) {
            return res.status(400).json({ message: 'Each logo must have id, src, and alt properties.' });
          }
        }
      }
    }

    if (!content[section]) {
      content[section] = sanitizedBody;
    } else {
      content[section] = { ...content[section], ...sanitizedBody };
    }
    content[section] = decodeContentValues(content[section]);
    await writeJSON('content.json', content);

    res.json({ message: `Section "${section}" updated`, data: content[section] });
  }
);

module.exports = router;
