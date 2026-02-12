import express from 'express';
import { authenticateToken, requireRole } from '../middleware/auth';
import { sqliteDB } from '../db/sqliteDB';

const router = express.Router();

interface Team {
  id: string;
  name: string;
  description?: string;
  leader_id?: string;
  member_ids?: string; // JSON
  status: string;
}

const generateTeamId = (): string => {
  const teams = sqliteDB.all<{ id: string }>('SELECT id FROM teams ORDER BY id DESC LIMIT 1');
  if (teams.length === 0) return 'TEAM-001';
  const lastId = teams[0].id;
  const num = parseInt(lastId.split('-')[1]) + 1;
  return `TEAM-${String(num).padStart(3, '0')}`;
};

router.use(authenticateToken);

// GET /api/teams
router.get('/', requireRole(['admin', 'DEVELOPER', 'OFFICER', 'radio', 'radio_center', 'EXECUTIVE']), async (_req, res) => {
  try {
    const teams = sqliteDB.all<Team>('SELECT * FROM teams ORDER BY name');
    const parsed = teams.map(t => ({
      ...t,
      member_ids: t.member_ids ? JSON.parse(t.member_ids) : []
    }));
    res.json(parsed);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/teams/:id
router.get('/:id', async (req, res) => {
  try {
    const team = sqliteDB.get<Team>('SELECT * FROM teams WHERE id = ?', [req.params.id]);
    if (!team) return res.status(404).json({ error: 'Team not found' });
    res.json({
      ...team,
      member_ids: team.member_ids ? JSON.parse(team.member_ids) : []
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/teams
router.post('/', requireRole(['admin', 'DEVELOPER', 'OFFICER', 'radio', 'radio_center', 'EXECUTIVE']), async (req, res) => {
  try {
    const newId = generateTeamId();
    const newTeam = {
      id: newId,
      name: req.body.name,
      description: req.body.description || null,
      leader_id: req.body.leader_id || null,
      member_ids: JSON.stringify(req.body.member_ids || []),
      status: req.body.status || 'Active'
    };
    sqliteDB.insert('teams', newTeam);
    const created = sqliteDB.get<Team>('SELECT * FROM teams WHERE id = ?', [newId]);
    res.status(201).json(created);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/teams/:id
router.put('/:id', requireRole(['admin', 'DEVELOPER', 'OFFICER']), async (req, res) => {
  try {
    const updateData: any = {};
    if (req.body.name) updateData.name = req.body.name;
    if (req.body.description) updateData.description = req.body.description;
    if (req.body.leader_id) updateData.leader_id = req.body.leader_id;
    if (req.body.member_ids) updateData.member_ids = JSON.stringify(req.body.member_ids);
    if (req.body.status) updateData.status = req.body.status;

    sqliteDB.update('teams', req.params.id, updateData);
    const updated = sqliteDB.get<Team>('SELECT * FROM teams WHERE id = ?', [req.params.id]);
    if (!updated) return res.status(404).json({ error: 'Team not found' });
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/teams/:id
router.delete('/:id', requireRole(['admin', 'DEVELOPER', 'OFFICER', 'radio', 'radio_center', 'EXECUTIVE']), async (req, res) => {
  try {
    const result = sqliteDB.delete('teams', req.params.id);
    if (result.changes === 0) return res.status(404).json({ error: 'Team not found' });
    res.status(204).send();
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
