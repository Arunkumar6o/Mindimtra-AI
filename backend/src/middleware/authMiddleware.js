import { verifyToken } from '../services/jwtService.js';

export function authenticateToken(req, res, next) {
  const authHeader = req.headers ? req.headers['authorization'] : null;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. Missing or invalid Authorization header.'
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const verified = verifyToken(token);
    req.user = verified;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: err.message || 'Invalid authorization token.'
    });
  }
}
