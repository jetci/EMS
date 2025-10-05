import express from 'express';

const router = express.Router();

// Mock teams data
const mockTeams = [
  { id: 'TEAM-001', name: 'ทีมเหนือ', description: 'รับผิดชอบพื้นที่ภาคเหนือ', memberCount: 5, status: 'Active' },
  { id: 'TEAM-002', name: 'ทีมใต้', description: 'รับผิดชอบพื้นที่ภาคใต้', memberCount: 4, status: 'Active' },
  { id: 'TEAM-003', name: 'ทีมกลาง', description: 'รับผิดชอบพื้นที่ภาคกลาง', memberCount: 6, status: 'Active' },
];

// GET /api/teams
router.get('/', async (_req, res) => {
  try {
    res.json(mockTeams);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/teams/:id
router.get('/:id', async (req, res) => {
  try {
    const team = mockTeams.find(t => t.id === req.params.id);
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }
    res.json(team);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/teams
router.post('/', async (req, res) => {
  try {
    const newTeam = {
      id: `TEAM-${String(mockTeams.length + 1).padStart(3, '0')}`,
      ...req.body,
      memberCount: 0,
      status: 'Active'
    };
    mockTeams.push(newTeam);
    res.status(201).json(newTeam);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/teams/:id
router.put('/:id', async (req, res) => {
  try {
    const index = mockTeams.findIndex(t => t.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: 'Team not found' });
    }
    mockTeams[index] = { ...mockTeams[index], ...req.body };
    res.json(mockTeams[index]);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/teams/:id
router.delete('/:id', async (req, res) => {
  try {
    const index = mockTeams.findIndex(t => t.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: 'Team not found' });
    }
    mockTeams.splice(index, 1);
    res.status(204).send();
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
