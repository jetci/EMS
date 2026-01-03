import express from 'express';
import { sqliteDB } from '../db/sqliteDB';
import { auditService } from '../services/auditService';
import { authenticateToken, requireRole } from '../middleware/auth';
import { hashPassword, verifyPassword } from '../utils/password';
import { validateUserInput, checkDuplicateEmail, validatePasswordReset, sanitizeInput } from '../middleware/validation';
import { preventPrivilegeEscalation, preventSelfDeletion, preventDeveloperDeletion, ensureAdminExists } from '../middleware/roleProtection';

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
  const users = sqliteDB.all<User>('SELECT id FROM users ORDER BY id DESC LIMIT 1');
  if (users.length === 0) return 'USR-001';

  const lastId = users[0].id;
  const num = parseInt(lastId.split('-')[1]) + 1;
  return `USR-${String(num).padStart(3, '0')}`;
};

// GET /api/users
router.get('/', authenticateToken, requireRole(['admin', 'DEVELOPER']), async (req, res) => {
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
router.post('/', authenticateToken, requireRole(['admin', 'DEVELOPER']), sanitizeInput, validateUserInput, checkDuplicateEmail, preventPrivilegeEscalation, async (req, res) => {
  try {
    const newId = generateUserId();

    // Hash password before storing
    const plainPassword = req.body.password || 'password';
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

    sqliteDB.insert('users', newUser);

    // Audit Log
    const currentUser = (req as any).user;
    auditService.log(
      currentUser?.email || 'unknown',
      currentUser?.role || 'unknown',
      'CREATE_USER',
      newId,
      { email: newUser.email, role: newUser.role }
    );

    const created = sqliteDB.get<User>('SELECT * FROM users WHERE id = ?', [newId]);
    res.status(201).json(excludePassword(created!));
  } catch (err: any) {
    console.error('Error creating user:', err);
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/users/:id - Update user profile
router.put('/:id', authenticateToken, requireRole(['admin', 'DEVELOPER']), sanitizeInput, validateUserInput, checkDuplicateEmail, preventPrivilegeEscalation, async (req, res) => {
  try {
    const { password, ...updates } = req.body;

    // Password cannot be changed through this endpoint - use reset-password instead
    if (password) {
      return res.status(400).json({
        error: 'Password cannot be updated through this endpoint. Use /reset-password instead.'
      });
    }

    // Build update data
    const updateData: any = {};
    if (updates.email) updateData.email = updates.email;
    if (updates.role) updateData.role = updates.role;
    if (updates.fullName || updates.full_name) updateData.full_name = updates.fullName || updates.full_name;
    if (updates.status) updateData.status = updates.status;

    // Check if user exists
    const existingUser = sqliteDB.get<User>('SELECT * FROM users WHERE id = ?', [req.params.id]);
    if (!existingUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    sqliteDB.update('users', req.params.id, updateData);

    // Audit Log
    const currentUser = (req as any).user;
    auditService.log(
      currentUser?.email || 'unknown',
      currentUser?.role || 'unknown',
      'UPDATE_USER',
      req.params.id,
      updateData
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
    const { newPassword } = req.body;

    // Check if user exists
    const user = sqliteDB.get<User>('SELECT * FROM users WHERE id = ?', [req.params.id]);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Hash the new password
    const hashedPassword = await hashPassword(newPassword);

    sqliteDB.update('users', req.params.id, { password: hashedPassword });

    // Audit Log
    const currentUser = (req as any).user;
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
router.delete('/:id', authenticateToken, requireRole(['admin', 'DEVELOPER']), preventSelfDeletion, preventDeveloperDeletion, ensureAdminExists, async (req, res) => {
  try {
    const result = sqliteDB.delete('users', req.params.id);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Audit Log
    const currentUser = (req as any).user;
    auditService.log(
      currentUser?.email || 'unknown',
      currentUser?.role || 'unknown',
      'DELETE_USER',
      req.params.id
    );

    res.status(204).send();
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
