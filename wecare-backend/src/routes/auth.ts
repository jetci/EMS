import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../db/connection';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';

// Mock users for initial login (will be replaced by real DB later)
const mockUsers = [
  { id: 'USR-000', email: 'jetci.jm@gmail.com', password: 'g0KEk,^],k;yo', role: 'DEVELOPER', full_name: 'System Developer' },
  { id: 'USR-001', email: 'admin@wecare.dev', password: 'admin123', role: 'admin', full_name: 'Admin User' },
  { id: 'USR-002', email: 'office1@wecare.dev', password: 'password', role: 'radio_center', full_name: 'Radio Center Staff' },
  { id: 'USR-003', email: 'driver1@wecare.dev', password: 'password', role: 'driver', full_name: 'Driver One' },
  { id: 'USR-004', email: 'community1@wecare.dev', password: 'password', role: 'community', full_name: 'Community Officer' },
  { id: 'USR-005', email: 'officer1@wecare.dev', password: 'password', role: 'OFFICER', full_name: 'Officer Staff' },
  { id: 'USR-006', email: 'executive1@wecare.dev', password: 'password', role: 'EXECUTIVE', full_name: 'Executive Manager' },
];

router.post('/login', async (req, res) => {
  const { email, password } = req.body as { email: string; password: string };
  try {
    // Temporary mock user check
    const user = mockUsers.find((u) => u.email === email);

    if (!user || user.password !== password) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Exclude password from response
    const { password: _omit, ...userWithoutPassword } = user as any;
    res.json({ user: userWithoutPassword, token });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Internal server error' });
  }
});

export default router;
