import express from 'express';
import jwt from 'jsonwebtoken';
import { sqliteDB } from '../db/sqliteDB';
import { hashPassword, verifyPassword, validatePasswordStrength } from '../utils/password';
import { auditService } from '../services/auditService';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('FATAL: JWT_SECRET must be set in environment variables');
}

// User interface
interface User {
  id: string;
  email: string;
  password: string;
  role: string;
  full_name: string;
  date_created: string;
  status: string;
}

// Driver interface for lookup
interface Driver {
  id: string;
  user_id?: string;
}

// POST /auth/login
router.post('/auth/login', async (req, res) => {
  const { email, password } = req.body as { email: string; password: string };

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const user = sqliteDB.get<User>('SELECT * FROM users WHERE email = ?', [email]);

    if (!user) {
      // Audit failed login attempt
      auditService.log(email, 'unknown', 'LOGIN_FAILED', undefined, { reason: 'User not found' });
      return res.status(401).json({ error: 'Invalid credentials' });
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
      // Audit failed login attempt
      auditService.log(email, user.role, 'LOGIN_FAILED', user.id, { reason: 'Invalid password' });
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check if user is active
    if (user.status !== 'Active') {
      auditService.log(email, user.role, 'LOGIN_FAILED', user.id, { reason: 'Account inactive' });
      return res.status(403).json({ error: 'Account is inactive' });
    }

    // Find driver_id if user is a driver
    let driver_id: string | undefined;
    if (user.role === 'driver') {
      try {
        const driver = sqliteDB.get<Driver>(
          'SELECT id FROM drivers WHERE user_id = ?',
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

    // Audit successful login
    auditService.log(email, user.role, 'LOGIN', user.id);

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

// POST /auth/register
router.post('/auth/register', async (req, res) => {
  const { email, password, name, phone, role } = req.body;

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
    const existing = sqliteDB.get<User>('SELECT id FROM users WHERE email = ?', [email]);
    if (existing) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Generate new ID
    const users = sqliteDB.all<{ id: string }>('SELECT id FROM users ORDER BY id DESC LIMIT 1');
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

    sqliteDB.insert('users', newUser);

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

  if (!userId || !currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Validate new password strength
  const pwdValidation = validatePasswordStrength(newPassword);
  if (!pwdValidation.valid) {
    return res.status(400).json({ error: 'Password validation failed', details: pwdValidation.errors });
  }

  try {
    const user = sqliteDB.get<User>('SELECT * FROM users WHERE id = ?', [userId]);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify current password using bcrypt
    const isCurrentPasswordValid = await verifyPassword(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      auditService.log(user.email, user.role, 'CHANGE_PASSWORD_FAILED', userId, { reason: 'Invalid current password' });
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    // Hash new password
    const hashedNewPassword = await hashPassword(newPassword);

    sqliteDB.update('users', userId, { password: hashedNewPassword });

    // Audit log
    auditService.log(user.email, user.role, 'CHANGE_PASSWORD', userId);

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
    const user = sqliteDB.get<User>('SELECT * FROM users WHERE id = ?', [decoded.id]);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { password: _omit, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (err: any) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

// PUT /auth/profile - Update current user profile
router.put('/auth/profile', async (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
    const { password, role, ...updates } = req.body; // Don't allow password/role changes here

    const updateData: any = {};
    if (updates.fullName || updates.name) {
      updateData.full_name = updates.fullName || updates.name;
    }
    if (updates.phone) updateData.phone = updates.phone;

    sqliteDB.update('users', decoded.id, updateData);

    const updated = sqliteDB.get<User>('SELECT * FROM users WHERE id = ?', [decoded.id]);
    if (!updated) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { password: _omit, ...userWithoutPassword } = updated;
    res.json(userWithoutPassword);
  } catch (err: any) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

export default router;
