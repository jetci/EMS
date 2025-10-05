import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { db } from '../db/connection';

export interface AuthUser {
  id: string;
  email?: string;
  role?: string;
  driver_id?: string;
}

export interface AuthRequest extends Request {
  user?: AuthUser;
}

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';

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
    // If users table exists, enrich the user info; otherwise, proceed with decoded info.
    try {
      const userRes = await db.query('SELECT id, email, role FROM users WHERE id = $1', [userId]);
      if (userRes.rows.length > 0) {
        decoded.email = decoded.email || userRes.rows[0].email;
        decoded.role = decoded.role || userRes.rows[0].role;
      }
    } catch {}

    // Determine driver_id. Priority:
    // 1) driver_id from token
    // 2) drivers.user_id matches user id
    // 3) drivers.email matches user email (if available)
    if (!decoded.driver_id) {
      try {
        const byUserId = await db.query('SELECT id FROM drivers WHERE user_id = $1 LIMIT 1', [userId]);
        if (byUserId.rows.length > 0) {
          decoded.driver_id = byUserId.rows[0].id;
        } else if (decoded.email) {
          const byEmail = await db.query('SELECT id FROM drivers WHERE email = $1 LIMIT 1', [decoded.email]);
          if (byEmail.rows.length > 0) {
            decoded.driver_id = byEmail.rows[0].id;
          }
        }
      } catch {}
    }

    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};
