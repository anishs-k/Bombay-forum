const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'tbf-editorial-secret-key-2026-mumbai-982347';

function generateToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
}

function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
}

// Middleware for Admin Pages (redirects to /admin/login if not authenticated)
function requireAdminPageAuth(req, res, next) {
  const token = req.cookies?.tbf_admin_token || req.headers?.authorization?.replace('Bearer ', '');

  if (!token) {
    return res.redirect('/admin/login');
  }

  const user = verifyToken(token);
  if (!user) {
    res.clearCookie('tbf_admin_token');
    return res.redirect('/admin/login');
  }

  req.user = user;
  res.locals.currentUser = user;
  next();
}

// Middleware for API Endpoints (returns 401 JSON if not authenticated)
function requireAdminApiAuth(req, res, next) {
  const token = req.cookies?.tbf_admin_token || req.headers?.authorization?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ success: false, error: 'Authentication required. No token provided.' });
  }

  const user = verifyToken(token);
  if (!user) {
    return res.status(401).json({ success: false, error: 'Invalid or expired session token.' });
  }

  req.user = user;
  next();
}

module.exports = {
  JWT_SECRET,
  generateToken,
  verifyToken,
  requireAdminPageAuth,
  requireAdminApiAuth
};
