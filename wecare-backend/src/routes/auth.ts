import express from 'express';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { db } from '../db';
import { hashPassword, verifyPassword, validatePasswordStrength } from '../utils/password';
import { auditService } from '../services/auditService';
import accountLockoutService from '../services/accountLockoutService';
import { loginSchema, registerSchema, validateRequest } from '../middleware/joiValidation';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('FATAL: JWT_SECRET must be set in environment variables');
}

// Configure multer for profile image uploads
const uploadDir = path.join(__dirname, '../../uploads/profiles');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: (req: any, file: any, cb: any) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files (JPEG, PNG, WEBP) are allowed'));
    }
  }
});

// User interface
interface User {
  id: string;
  email: string;
  password: string;
  role: string;
  full_name: string;
  date_created: string;
  status: string;
  profile_image_url?: string;
  phone?: string;
}

// Driver interface for lookup
interface Driver {
  id: string;
  user_id?: string;
}

// Utility function to get client IP address
// Handles proxies (X-Forwarded-For, X-Real-IP, etc)
const getClientIp = (req: any): string => {
  const xForwardedFor = req.headers['x-forwarded-for'];
  if (xForwardedFor) {
    // x-forwarded-for can contain multiple IPs, get the first one
    return (xForwardedFor as string).split(',')[0].trim();
  }

  const xRealIp = req.headers['x-real-ip'];
  if (xRealIp) {
    return xRealIp as string;
  }

  return req.ip || req.connection?.remoteAddress || 'unknown';
};

// POST /auth/login
router.post('/auth/login', async (req, res) => {
  const { email, password } = req.body as { email: string; password: string };

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const clientIp = getClientIp(req);

    // Check if account is locked
    const lockStatus = accountLockoutService.isAccountLocked(email);
    if (lockStatus.locked) {
      const remainingMinutes = Math.ceil(lockStatus.remainingTime! / 60);
      auditService.log(email, 'unknown', 'LOGIN_BLOCKED', undefined, {
        reason: 'Account locked',
        attempts: lockStatus.attempts,
        remainingTime: lockStatus.remainingTime
      }, clientIp);
      return res.status(423).json({
        error: 'Account temporarily locked',
        message: `Too many failed login attempts. Please try again in ${remainingMinutes} minute(s).`,
        remainingTime: lockStatus.remainingTime,
        lockedUntil: new Date(Date.now() + lockStatus.remainingTime! * 1000).toISOString()
      });
    }

    const user = await db.get<User>('SELECT * FROM users WHERE email = $1', [email]);

    if (!user) {
      // Record failed attempt
      accountLockoutService.recordFailedAttempt(email);
      const remaining = accountLockoutService.getRemainingAttempts(email);

      // Audit failed login attempt
      auditService.log(email, 'unknown', 'LOGIN_FAILED', undefined, {
        reason: 'User not found',
        remainingAttempts: remaining
      }, clientIp);

      return res.status(401).json({
        error: 'Invalid credentials',
        remainingAttempts: remaining
      });
    }

    // Verify password using bcrypt
    console.log('🔐 Login attempt:', {
      email,
      providedPassword: password,
      storedHash: user.password.substring(0, 20) + '...',
      hashStartsWith: user.password.substring(0, 4)
    });
    const isPasswordValid = await verifyPassword(password, user.password);
    console.log('✅ Password valid:', isPasswordValid);
    if (!isPasswordValid) {
      // Record failed attempt
      accountLockoutService.recordFailedAttempt(email);
      const remaining = accountLockoutService.getRemainingAttempts(email);

      // Audit failed login attempt
      auditService.log(email, user.role, 'LOGIN_FAILED', user.id, {
        reason: 'Invalid password',
        remainingAttempts: remaining
      }, clientIp);

      return res.status(401).json({
        error: 'Invalid credentials',
        remainingAttempts: remaining,
        warning: remaining <= 2 ? `Warning: ${remaining} attempt(s) remaining before account lockout` : undefined
      });
    }

    // Check if user is active
    if (user.status !== 'Active') {
      auditService.log(email, user.role, 'LOGIN_FAILED', user.id, { reason: 'Account inactive' }, clientIp);
      return res.status(403).json({ error: 'Account is inactive' });
    }

    // Find driver_id if user is a driver
    let driver_id: string | undefined;
    if (user.role === 'driver') {
      try {
        const driver = await db.get<Driver>(
          'SELECT id FROM drivers WHERE user_id = $1',
          [user.id]
        );
        if (driver) {
          driver_id = driver.id;
        }
      } catch { }
    }

    const tokenPayload: any = { id: user.id, email: user.email, role: user.role };
    if (driver_id) tokenPayload.driver_id = driver_id;

    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '7d' });

    // Clear failed login attempts on successful login
    accountLockoutService.clearFailedAttempts(email);
    // Also clear user-based rate limiter attempts if available
    (res as any)?.clearUserAttempts?.();

    // Audit successful login
    auditService.log(email, user.role, 'LOGIN', user.id, undefined, clientIp);

    // Exclude password from response
    const { password: _omit, ...userWithoutPassword } = user;

    // Add driver_id to response if found
    const responseUser = driver_id
      ? { ...userWithoutPassword, driver_id }
      : userWithoutPassword;

    res.json({ user: responseUser, token });
  } catch (err: any) {
    console.error('Login error:', err);
    res.status(500).json({ error: err?.message || 'Internal server error' });
  }
});

// POST /auth/logout
router.post('/auth/logout', async (req, res) => {
  const authHeader = req.headers.authorization;
  const clientIp = getClientIp(req);

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    // Verify token first
    const decoded = jwt.verify(token, JWT_SECRET) as any;

    // Import blacklist service
    const { tokenBlacklist } = require('../services/tokenBlacklist');

    // Add token to blacklist
    const expiresAt = decoded.exp * 1000; // Convert to milliseconds
    tokenBlacklist.addToBlacklist(token, decoded.id, expiresAt);

    // Audit log
    auditService.log(decoded.email, decoded.role, 'LOGOUT', decoded.id, undefined, clientIp);

    res.json({ message: 'Logged out successfully' });
  } catch (err: any) {
    // Even if token is invalid, return success (idempotent logout)
    res.json({ message: 'Logged out successfully' });
  }
});


// POST /auth/register
router.post('/auth/register', async (req, res) => {
  const { email, password, name, phone, role } = req.body;
  const clientIp = getClientIp(req);

  try {
    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Validate password strength
    const pwdValidation = validatePasswordStrength(password);
    if (!pwdValidation.valid) {
      return res.status(400).json({ error: 'Password validation failed', details: pwdValidation.errors });
    }

    // Check if email already exists
    const existing = await db.get<User>('SELECT id FROM users WHERE email = $1', [email]);
    if (existing) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Generate new ID
    const users = await db.all<{ id: string }>('SELECT id FROM users ORDER BY id DESC LIMIT 1');
    let newId = 'USR-001';
    if (users.length > 0) {
      const lastId = users[0].id;
      const num = parseInt(lastId.split('-')[1]) + 1;
      newId = `USR-${String(num).padStart(3, '0')}`;
    }

    // Hash password before storing
    const hashedPassword = await hashPassword(password);

    const newUser = {
      id: newId,
      email,
      password: hashedPassword,
      role: role || 'community',
      full_name: name || email.split('@')[0],
      date_created: new Date().toISOString(),
      status: 'Active'
    };

    await db.insert('users', newUser);

    // Audit log
    auditService.log(email, newUser.role, 'REGISTER', newId);

    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, role: newUser.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const { password: _omit, ...userWithoutPassword } = newUser;
    res.status(201).json({ user: userWithoutPassword, token });
  } catch (err: any) {
    console.error('Registration error:', err);
    res.status(500).json({ error: err?.message || 'Internal server error' });
  }
});

// POST /auth/change-password
router.post('/auth/change-password', async (req, res) => {
  const { userId, currentPassword, newPassword } = req.body;
  const clientIp = getClientIp(req);

  if (!userId || !currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Validate new password strength
  const pwdValidation = validatePasswordStrength(newPassword);
  if (!pwdValidation.valid) {
    return res.status(400).json({ error: 'Password validation failed', details: pwdValidation.errors });
  }

  try {
    const user = await db.get<User>('SELECT * FROM users WHERE id = $1', [userId]);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify current password using bcrypt
    const isCurrentPasswordValid = await verifyPassword(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      auditService.log(user.email, user.role, 'CHANGE_PASSWORD_FAILED', userId, { reason: 'Invalid current password' }, clientIp);
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    // Hash new password
    const hashedNewPassword = await hashPassword(newPassword);

    await db.update('users', userId, { password: hashedNewPassword });

    // Audit log
    auditService.log(user.email, user.role, 'CHANGE_PASSWORD', userId, undefined, clientIp);

    res.json({ message: 'Password changed successfully' });
  } catch (err: any) {
    console.error('Change password error:', err);
    res.status(500).json({ error: err?.message || 'Internal server error' });
  }
});

// GET /auth/me - Get current user from token
router.get('/auth/me', async (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string; role: string };
    const user = await db.get<User>('SELECT * FROM users WHERE id = $1', [decoded.id]);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Convert snake_case to camelCase for frontend
    const { password: _omit, full_name, profile_image_url, date_created, ...rest } = user;
    const userResponse = {
      ...rest,
      name: full_name,
      profileImageUrl: profile_image_url,
      dateCreated: date_created,
    };
    res.json(userResponse);
  } catch (err: any) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

// PUT /auth/profile - Update current user profile
router.put('/auth/profile', async (req, res) => {
  console.log('🔵 PUT /auth/profile called - UPDATED VERSION');
  console.log('📋 Request method:', req.method);
  console.log('📋 Request path:', req.path);
  console.log('📋 Request URL:', req.url);
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log('❌ No auth header or invalid format');
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];
  console.log('🔑 Token received:', token.substring(0, 20) + '...');
  console.log('🔐 JWT_SECRET:', JWT_SECRET ? JWT_SECRET.substring(0, 20) + '...' : 'NOT SET');

  let decoded;
  try {
    console.log('🔄 Verifying token...');
    decoded = jwt.verify(token, JWT_SECRET) as { id: string };
    console.log('✅ Token verified! User ID:', decoded.id);
  } catch (err) {
    console.log('❌ Token verification failed:', err);
    return res.status(401).json({ error: 'Invalid token' });
  }

  try {
    const { password, role, ...updates } = req.body; // Don't allow password/role changes here
    console.log('📦 Updates:', updates);

    const updateData: any = {};
    if (updates.fullName || updates.name) {
      updateData.full_name = updates.fullName || updates.name;
    }
    if (updates.phone) updateData.phone = updates.phone;
    if (updates.profileImageUrl !== undefined) {
      updateData.profile_image_url = updates.profileImageUrl;
    }
    console.log('💾 Update data:', Object.keys(updateData));

    try {
      await db.update('users', decoded.id, updateData);
    } catch (dbError: any) {
      console.error('❌ Database update error:', dbError);
      if (dbError.code === '23505') { // Postgres unique_violation code
        return res.status(400).json({ error: 'Database constraint violation (e.g. duplicate phone/email)' });
      }
      throw dbError;
    }

    console.log('✅ Database updated');

    const updated = await db.get<User>('SELECT * FROM users WHERE id = $1', [decoded.id]);
    if (!updated) {
      console.log('❌ User not found after update');
      return res.status(404).json({ error: 'User not found' });
    }
    console.log('✅ User retrieved from DB');

    // Convert snake_case to camelCase for frontend
    const { password: _omit, full_name, profile_image_url, date_created, ...rest } = updated;
    const userResponse = {
      ...rest,
      name: full_name,
      profileImageUrl: profile_image_url,
      dateCreated: date_created,
    };
    console.log('✅ Sending response:', { id: userResponse.id, name: userResponse.name, hasImage: !!userResponse.profileImageUrl });
    res.json(userResponse);
  } catch (err: any) {
    console.log('❌ Error in PUT /auth/profile:', err.message);
    console.log('❌ Stack:', err.stack);
    res.status(500).json({ error: 'Internal server error during profile update' });
  }
});

// POST /auth/upload-profile-image - Upload profile image
router.post('/auth/upload-profile-image', upload.single('profile_image'), async (req, res) => {
  try {
    // Verify token
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET!) as { id: string; email: string; role: string };

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Get user
    const user = await db.get<User>('SELECT * FROM users WHERE id = $1', [decoded.id]);
    if (!user) {
      // Clean up uploaded file
      fs.unlinkSync(req.file.path);
      return res.status(404).json({ error: 'User not found' });
    }

    // Delete old profile image if exists
    if (user.profile_image_url) {
      const oldImagePath = path.join(__dirname, '../..', user.profile_image_url);
      if (fs.existsSync(oldImagePath)) {
        try {
          fs.unlinkSync(oldImagePath);
        } catch (err) {
          console.error('Failed to delete old profile image:', err);
        }
      }
    }

    // Update user with new image URL
    const imageUrl = `/uploads/profiles/${req.file.filename}`;
    await db.update('users', decoded.id, {
      profile_image_url: imageUrl
    });

    // Audit log
    auditService.log(user.email, user.role, 'PROFILE_IMAGE_UPLOAD', decoded.id);

    res.json({
      message: 'Profile image uploaded successfully',
      imageUrl: imageUrl
    });
  } catch (err: any) {
    console.error('Upload profile image error:', err);

    // Clean up uploaded file on error
    if (req.file) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (unlinkErr) {
        console.error('Failed to clean up file:', unlinkErr);
      }
    }

    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

export default router;

