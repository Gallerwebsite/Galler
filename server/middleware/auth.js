const jwt = require('jsonwebtoken');
const { extractToken, verifyToken } = require('../utils/authToken');

function authMiddleware(req, res, next) {
  const token = extractToken(req);

  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token.' });
  }
}

module.exports = authMiddleware;
