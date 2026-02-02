import express from 'express';
import { sqliteDB } from '../db/sqliteDB';
import { auditService } from '../services/auditService';
import { authenticateToken, requireRole } from '../middleware/auth';
import { hashPassword, verifyPassword, validatePasswordStrength } from '../utils/password';
import { validateUserInput, checkDuplicateEmail, validatePasswordReset, sanitizeInput } from '../middleware/validation';
// Note: preventPrivilegeEscalation, preventSelfDeletion, preventDeveloperDeletion, ensureAdminExists
// are not exported from roleProtection.ts - these middleware are not currently implemented

const router = express.Router();

// User interface
interface User {
  id: string;
  email: string;
  password?: string;
  role: string;
  full_name: string;
  date_created: string;
  status: string;
  created_at?: string;
  updated_at?: string;
}

// Helper to exclude password from response
const excludePassword = (user: User): Omit<User, 'password'> => {
  const { password, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

// Helper to generate next user ID
const generateUserId = (): string => {
  const users = sqliteDB.all<User>('SELECT id FROM users WHERE id LIKE \'USR-%\'');
  if (users.length === 0) return 'USR-001';

  // Extract numeric parts and find the maximum
  const numbers = users
    .map(u => parseInt(u.id.split('-')[1]))
    .filter(n => !isNaN(n));

  const maxNum = numbers.length > 0 ? Math.max(...numbers) : 0;
  const nextNum = maxNum + 1;

  return `USR-${String(nextNum).padStart(3, '0')}`;
};

// GET /api/users
router.get('/', authenticateToken, requireRole(['ADMIN', 'DEVELOPER']), async (req, res) => {
  try {
    const currentUser = (req as any).user;
    let users = sqliteDB.all<User>('SELECT * FROM users ORDER BY date_created DESC');

    // Filter out DEVELOPER users if current user is admin
    if (currentUser.role === 'admin') {
      users = users.filter(u => u.role !== 'DEVELOPER');
    }

    res.json(users.map(excludePassword));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/users/:id
router.get('/:id', authenticateToken, requireRole(['admin', 'DEVELOPER']), async (req, res) => {
  try {
    const currentUser = (req as any).user;
    const user = sqliteDB.get<User>('SELECT * FROM users WHERE id = ?', [req.params.id]);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Prevent admin from viewing DEVELOPER users
    if (currentUser.role === 'admin' && user.role === 'DEVELOPER') {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(excludePassword(user));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/users
router.post('/', authenticateToken, requireRole(['admin', 'DEVELOPER']), sanitizeInput, validateUserInput, checkDuplicateEmail, async (req, res) => {
  try {
    const currentUser = (req as any).user;

    // Protection: Only Developer can create Developer accounts
    if (req.body.role === 'DEVELOPER' && currentUser.role !== 'DEVELOPER') {
      return res.status(403).json({ error: 'Access denied: Only developers can create developer accounts' });
    }

    console.log('📝 Creating new user:', { email: req.body.email, role: req.body.role });
    const newId = generateUserId();
    console.log('🆔 Generated ID:', newId);

    // Get password (use default if not provided)
    const plainPassword = req.body.password || 'TempPass123!';

    // Validate password strength
    const pwdValidation = validatePasswordStrength(plainPassword);
    if (!pwdValidation.valid) {
      console.log('❌ Password validation failed:', pwdValidation.errors);
      return res.status(400).json({
        error: 'Password validation failed',
        details: pwdValidation.errors
      });
    }

    // Hash password before storing
    console.log('🔐 Hashing password...');
    const hashedPassword = await hashPassword(plainPassword);

    const newUser = {
      id: newId,
      email: req.body.email,
      password: hashedPassword,
      role: req.body.role,
      full_name: req.body.fullName || req.body.full_name,
      date_created: new Date().toISOString(),
      status: 'Active'
    };

    console.log('💾 Inserting user into database...');
    sqliteDB.insert('users', newUser);
    console.log('✅ User inserted successfully');

    // Audit Log
    auditService.log(
      currentUser?.email || 'unknown',
      currentUser?.role || 'unknown',
      'CREATE_USER',
      newId,
      { email: newUser.email, role: newUser.role }
    );

    const created = sqliteDB.get<User>('SELECT * FROM users WHERE id = ?', [newId]);
    console.log('✅ User created:', created?.email);
    res.status(201).json(excludePassword(created!));
  } catch (err: any) {
    console.error('❌ Error creating user:', err);
    console.error('Stack trace:', err.stack);
    res.status(500).json({ error: err.message || 'Failed to create user' });
  }
});

// PUT /api/users/:id - Update user profile
router.put('/:id', authenticateToken, requireRole(['admin', 'DEVELOPER']), sanitizeInput, validateUserInput, checkDuplicateEmail, async (req, res) => {
  try {
    const currentUser = (req as any).user;
    const { password, ...updates } = req.body;

    // Password cannot be changed through this endpoint - use reset-password instead
    if (password) {
      return res.status(400).json({
        error: 'Password cannot be updated through this endpoint. Use /reset-password instead.'
      });
    }

    // Check if user exists
    const existingUser = sqliteDB.get<User>('SELECT * FROM users WHERE id = ?', [req.params.id]);
    if (!existingUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Protection: Only Developer can modify Developer accounts
    if (existingUser.role === 'DEVELOPER' && currentUser.role !== 'DEVELOPER') {
      return res.status(403).json({ error: 'Access denied: Cannot modify developer accounts' });
    }

    // Protection: Only Developer can promote users to Developer
    if (updates.role === 'DEVELOPER' && currentUser.role !== 'DEVELOPER') {
      return res.status(403).json({ error: 'Access denied: Only developers can assign developer role' });
    }

    // Build update data
    const updateData: any = {};
    if (updates.email) updateData.email = updates.email;
    if (updates.role) updateData.role = updates.role;
    if (updates.fullName || updates.full_name) updateData.full_name = updates.fullName || updates.full_name;
    if (updates.status) updateData.status = updates.status;

    sqliteDB.update('users', req.params.id, updateData);

    // Audit Log with previous state for complete audit trail
    auditService.log(
      currentUser?.email || 'unknown',
      currentUser?.role || 'unknown',
      'UPDATE_USER',
      req.params.id,
      {
        previousState: {
          email: existingUser.email,
          role: existingUser.role,
          full_name: existingUser.full_name,
          status: existingUser.status
        },
        newState: updateData
      }
    );

    const updated = sqliteDB.get<User>('SELECT * FROM users WHERE id = ?', [req.params.id]);
    res.json(excludePassword(updated!));
  } catch (err: any) {
    console.error('Error updating user:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/users/:id/reset-password
router.post('/:id/reset-password', authenticateToken, requireRole(['admin', 'DEVELOPER']), validatePasswordReset, async (req, res) => {
  try {
    const currentUser = (req as any).user;
    const { newPassword } = req.body;

    // Validate password strength
    const pwdValidation = validatePasswordStrength(newPassword);
    if (!pwdValidation.valid) {
      return res.status(400).json({
        error: 'Password validation failed',
        details: pwdValidation.errors
      });
    }

    // Check if user exists
    const user = sqliteDB.get<User>('SELECT * FROM users WHERE id = ?', [req.params.id]);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Protection: Only Developer can reset password for Developer accounts
    if (user.role === 'DEVELOPER' && currentUser.role !== 'DEVELOPER') {
      return res.status(403).json({ error: 'Access denied: Cannot reset password for developer accounts' });
    }

    // Hash the new password
    const hashedPassword = await hashPassword(newPassword);

    sqliteDB.update('users', req.params.id, { password: hashedPassword });

    // Audit Log
    auditService.log(
      currentUser?.email || 'unknown',
      currentUser?.role || 'unknown',
      'RESET_PASSWORD',
      req.params.id,
      { targetUser: user.email }
    );

    res.json({ message: 'Password reset successfully' });
  } catch (err: any) {
    console.error('Error resetting password:', err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/users/:id
router.delete('/:id', authenticateToken, requireRole(['admin', 'DEVELOPER']), async (req, res) => {
  try {
    const currentUser = (req as any).user;

    const existingUser = sqliteDB.get<User>('SELECT * FROM users WHERE id = ?', [req.params.id]);
    if (!existingUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Protection: Only Developer can delete Developer accounts
    if (existingUser.role === 'DEVELOPER' && currentUser.role !== 'DEVELOPER') {
      return res.status(403).json({ error: 'Access denied: Cannot delete developer accounts' });
    }

    const result = sqliteDB.delete('users', req.params.id);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Audit Log with deleted user info
    auditService.log(
      currentUser?.email || 'unknown',
      currentUser?.role || 'unknown',
      'DELETE_USER',
      req.params.id,
      {
        deletedUser: {
          email: existingUser.email,
          role: existingUser.role,
          full_name: existingUser.full_name
        }
      }
    );

    res.status(204).send();
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
