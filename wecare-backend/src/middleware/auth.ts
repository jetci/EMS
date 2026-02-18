import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { db } from '../db';

export interface AuthUser {
  id: string;
  email?: string;
  role?: string;
  driver_id?: string;
}

export interface AuthRequest extends Request {
  user?: AuthUser;
}

const JWT_SECRET = process.env.JWT_SECRET || (process.env.NODE_ENV !== 'production' ? 'dev-jwt-secret-change-me' : undefined);
if (!JWT_SECRET) {
  throw new Error('FATAL: JWT_SECRET must be set in environment variables');
}

export const authenticateToken = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer <TOKEN>

  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthUser;
    const userId = decoded.id;

    if (!userId) {
      return res.status(401).json({ error: 'Invalid token payload' });
    }

    // Check if token is blacklisted (logged out)
    try {
      const { tokenBlacklist } = require('../services/tokenBlacklist');
      if (tokenBlacklist.isBlacklisted(token)) {
        return res.status(401).json({ error: 'Token has been revoked' });
      }
    } catch (err) {
      console.error('Error checking token blacklist:', err);
    }

    // Load user metadata from database if needed (email/role)
    try {
      const user = await db.get<any>('SELECT * FROM users WHERE id = $1', [userId]);
      if (user) {
        decoded.email = decoded.email || user.email;
        decoded.role = decoded.role || user.role;
      }
    } catch { }

    // Determine driver_id. Priority:
    // 1) driver_id from token
    // 2) drivers.user_id matches user id
    // 3) drivers.email matches user email (if available)
    if (!decoded.driver_id) {
      try {
        // Try to find driver by user_id first
        let driver = await db.get<any>('SELECT * FROM drivers WHERE user_id = $1', [userId]);

        // If not found and email available, try by email
        if (!driver && decoded.email) {
          driver = await db.get<any>('SELECT * FROM drivers WHERE email = $1', [decoded.email]);
        }

        if (driver) {
          decoded.driver_id = driver.id;
        }
      } catch { }
    }

    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

// Optional auth - extracts user from token if present, but doesn't require it
export const optionalAuth = async (req: AuthRequest, _res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as AuthUser;
      req.user = decoded;
    } catch {
      // Invalid token, just continue without user
    }
  }
  next();
};

export const requireRole = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    // Require authentication
    if (!req.user) {
      return res.status(401).json({
        error: 'Authentication required',
        message: 'You must be logged in to access this resource'
      });
    }

    // Require role
    if (!req.user.role) {
      return res.status(403).json({
        error: 'No role assigned',
        message: 'Your account does not have a role assigned'
      });
    }

    // Case-insensitive exact match
    const normalize = (role: string) => {
      const upper = role.toUpperCase().trim();
      if (upper === 'OFFICE') return 'OFFICER';
      if (upper === 'RADIO') return 'RADIO_CENTER';
      if (upper === 'ADMIN') return 'ADMIN';
      return upper;
    };
    const userRole = normalize(req.user.role);
    const allowedRoles = roles.map(normalize);

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        error: 'Insufficient permissions',
        message: `This resource requires one of the following roles: ${roles.join(', ')}`,
        userRole: req.user.role,
        requiredRoles: roles
      });
    }

    next();
  };
};
