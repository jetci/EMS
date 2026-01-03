import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { db } from '../db/connection';
import { jsonDB } from '../db/jsonDB';

export interface AuthUser {
  id: string;
  email?: string;
  role?: string;
  driver_id?: string;
}

export interface AuthRequest extends Request {
  user?: AuthUser;
}

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('FATAL: JWT_SECRET must be set in environment variables');
}

export const authenticateToken = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer <TOKEN>

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthUser;
    const userId = decoded.id;

    if (!userId) {
      return res.status(401).json({ error: 'Invalid token payload' });
    }

    // Load user metadata if needed (email/role).
    try {
      const user = jsonDB.findById<any>('users', userId);
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
        const drivers = jsonDB.read<any>('drivers');
        let driver = drivers.find((d: any) => d.user_id === userId);
        if (!driver && decoded.email) {
          driver = drivers.find((d: any) => d.email === decoded.email);
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
    if (!req.user || !req.user.role) {
      return res.status(403).json({ error: 'Unauthorized: No role assigned' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
    }

    next();
  };
};
