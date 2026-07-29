const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { readJSON } = require('../utils/dataStore');
const {
  COOKIE_NAME,
  getCookieOptions,
  extractToken,
  verifyToken,
} = require('../utils/authToken');

const router = express.Router();

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      const adminData = await readJSON('admin.json');
      if (!adminData) {
        return res.status(500).json({ message: 'Server not initialized' });
      }

      const user = adminData.users.find((u) => u.email === email);
      if (!user) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.cookie(COOKIE_NAME, token, getCookieOptions());

      res.json({
        user: { id: user.id, email: user.email, name: user.name, role: user.role }
      });
    } catch (err) {
      res.status(500).json({ message: 'Server error' });
    }
  }
);

router.post('/verify', (req, res) => {
  const token = extractToken(req);

  if (!token) {
    return res.status(401).json({ valid: false, message: 'No token provided' });
  }

  try {
    const decoded = verifyToken(token);
    res.json({ valid: true, user: { id: decoded.id, email: decoded.email, role: decoded.role } });
  } catch (err) {
    res.status(401).json({ valid: false, message: 'Invalid or expired token' });
  }
});

router.post('/logout', (req, res) => {
  res.clearCookie(COOKIE_NAME, getCookieOptions());
  res.json({ message: 'Logged out successfully' });
});

module.exports = router;
