const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';
const JWT_EXPIRE = process.env.JWT_EXPIRE || '7d';

// Generate JWT token
const generateToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRE,
    issuer: 'social-auth-app',
    audience: 'social-auth-users'
  });
};

// Verify JWT token
const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid token');
  }
};

// Create tokens for user
const createTokensForUser = (user) => {
  const payload = {
    id: user._id,
    email: user.email,
    name: user.name,
    providers: user.providers.map(p => p.provider)
  };

  const accessToken = generateToken(payload);
  
  // Create refresh token with longer expiration
  const refreshPayload = {
    id: user._id,
    type: 'refresh'
  };
  
  const refreshToken = jwt.sign(refreshPayload, JWT_SECRET, {
    expiresIn: '30d',
    issuer: 'social-auth-app',
    audience: 'social-auth-users'
  });

  return {
    accessToken,
    refreshToken,
    expiresIn: JWT_EXPIRE,
    tokenType: 'Bearer'
  };
};

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ 
      error: 'Access token required',
      code: 'NO_TOKEN' 
    });
  }

  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ 
      error: 'Invalid or expired token',
      code: 'INVALID_TOKEN' 
    });
  }
};

// Middleware to optionally verify JWT token
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    req.user = null;
    return next();
  }

  try {
    const decoded = verifyToken(token);
    req.user = decoded;
  } catch (error) {
    req.user = null;
  }
  
  next();
};

module.exports = {
  generateToken,
  verifyToken,
  createTokensForUser,
  authenticateToken,
  optionalAuth
};