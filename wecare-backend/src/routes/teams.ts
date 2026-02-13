import express from 'express';
import { authenticateToken, requireRole } from '../middleware/auth';
import { db } from '../db';

const router = express.Router();

interface Team {
  id: string;
  name: string;
  description?: string;
  leader_id?: string;
  member_ids?: string | any[]; // JSON in DB
  status: string;
}

const generateTeamId = async (): Promise<string> => {
  const teams = await db.all<{ id: string }>('SELECT id FROM teams ORDER BY id DESC LIMIT 1');
  if (teams.length === 0) return 'TEAM-001';
  const lastId = teams[0].id;
  const num = parseInt(lastId.split('-')[1]) + 1;
  return `TEAM-${String(num).padStart(3, '0')}`;
};

router.use(authenticateToken);

// GET /api/teams
router.get('/', requireRole(['admin', 'DEVELOPER', 'OFFICER', 'radio_center', 'EXECUTIVE']), async (_req, res) => {
  try {
    const teams = await db.all<Team>('SELECT * FROM teams ORDER BY name');
    const parsed = teams.map(t => ({
      ...t,
      member_ids: typeof t.member_ids === 'string' ? JSON.parse(t.member_ids) : (t.member_ids || [])
    }));
    res.json(parsed);
  } catch (err: any) {
    console.error('Fetch teams error:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/teams/:id
router.get('/:id', async (req, res) => {
  try {
    const team = await db.get<Team>('SELECT * FROM teams WHERE id = $1', [req.params.id]);
    if (!team) return res.status(404).json({ error: 'Team not found' });
    res.json({
      ...team,
      member_ids: typeof team.member_ids === 'string' ? JSON.parse(team.member_ids) : (team.member_ids || [])
    });
  } catch (err: any) {
    console.error('Fetch team error:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/teams
router.post('/', requireRole(['ADMIN', 'DEVELOPER', 'OFFICER']), async (req, res) => {
  try {
    const newId = await generateTeamId();
    const newTeam = {
      id: newId,
      name: req.body.name,
      description: req.body.description || null,
      leader_id: req.body.leader_id || null,
      member_ids: JSON.stringify(req.body.member_ids || []),
      status: req.body.status || 'Active'
    };
    await db.insert('teams', newTeam);
    const created = await db.get<Team>('SELECT * FROM teams WHERE id = $1', [newId]);
    res.status(201).json(created);
  } catch (err: any) {
    console.error('Create team error:', err);
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/teams/:id
router.put('/:id', requireRole(['ADMIN', 'DEVELOPER', 'OFFICER']), async (req, res) => {
  try {
    const updateData: any = {};
    if (req.body.name) updateData.name = req.body.name;
    if (req.body.description !== undefined) updateData.description = req.body.description;
    if (req.body.leader_id !== undefined) updateData.leader_id = req.body.leader_id;
    if (req.body.member_ids) updateData.member_ids = JSON.stringify(req.body.member_ids);
    if (req.body.status) updateData.status = req.body.status;

    await db.update('teams', req.params.id, updateData);
    const updated = await db.get<Team>('SELECT * FROM teams WHERE id = $1', [req.params.id]);
    if (!updated) return res.status(404).json({ error: 'Team not found' });
    res.json(updated);
  } catch (err: any) {
    console.error('Update team error:', err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/teams/:id
router.delete('/:id', requireRole(['admin', 'DEVELOPER', 'OFFICER']), async (req, res) => {
  try {
    await db.delete('teams', req.params.id);
    res.status(204).send();
  } catch (err: any) {
    console.error('Delete team error:', err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
