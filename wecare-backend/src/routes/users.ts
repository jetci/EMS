import express from 'express';

const router = express.Router();

// Mock users data
const mockUsers = [
  { id: 'USR-000', email: 'jetci.jm@gmail.com', role: 'DEVELOPER', fullName: 'System Developer', dateCreated: '2024-01-01', status: 'Active' },
  { id: 'USR-001', email: 'admin@wecare.dev', role: 'admin', fullName: 'Admin User', dateCreated: '2024-01-01', status: 'Active' },
  { id: 'USR-002', email: 'office1@wecare.dev', role: 'radio_center', fullName: 'Radio Center Staff', dateCreated: '2024-01-02', status: 'Active' },
  { id: 'USR-003', email: 'driver1@wecare.dev', role: 'driver', fullName: 'Driver One', dateCreated: '2024-01-03', status: 'Active' },
  { id: 'USR-004', email: 'community1@wecare.dev', role: 'community', fullName: 'Community Officer', dateCreated: '2024-01-04', status: 'Active' },
  { id: 'USR-005', email: 'officer1@wecare.dev', role: 'OFFICER', fullName: 'Officer Staff', dateCreated: '2024-01-05', status: 'Active' },
  { id: 'USR-006', email: 'executive1@wecare.dev', role: 'EXECUTIVE', fullName: 'Executive Manager', dateCreated: '2024-01-06', status: 'Active' },
];

// GET /api/users
router.get('/', async (_req, res) => {
  try {
    res.json(mockUsers);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/users/:id
router.get('/:id', async (req, res) => {
  try {
    const user = mockUsers.find(u => u.id === req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/users
router.post('/', async (req, res) => {
  try {
    const newUser = {
      id: `USR-${String(mockUsers.length + 1).padStart(3, '0')}`,
      ...req.body,
      dateCreated: new Date().toISOString(),
      status: 'Active'
    };
    mockUsers.push(newUser);
    res.status(201).json(newUser);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/users/:id
router.put('/:id', async (req, res) => {
  try {
    const index = mockUsers.findIndex(u => u.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: 'User not found' });
    }
    mockUsers[index] = { ...mockUsers[index], ...req.body };
    res.json(mockUsers[index]);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/users/:id
router.delete('/:id', async (req, res) => {
  try {
    const index = mockUsers.findIndex(u => u.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: 'User not found' });
    }
    mockUsers.splice(index, 1);
    res.status(204).send();
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
