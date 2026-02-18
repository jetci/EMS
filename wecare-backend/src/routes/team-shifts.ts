import express from 'express';
import { authenticateToken, requireRole } from '../middleware/auth';
import { db } from '../db';

const router = express.Router();

interface TeamShift {
  id: string;
  team_id: string;
  shift_date: string;
  status: string;
  notes?: string;
  created_by?: string;
}

interface TeamShiftAssignment {
  id: string;
  team_shift_id: string;
  vehicle_id?: string;
  driver_id?: string;
  helper_ids?: any;
  properties?: any;
}

const generateId = async (table: string, prefix: string): Promise<string> => {
  const rows = await db.all<{ id: string }>(`SELECT id FROM ${table} ORDER BY id DESC LIMIT 1`);
  if (rows.length === 0) return `${prefix}-001`;
  const last = rows[0].id;
  const num = parseInt(last.split('-')[1]) + 1;
  return `${prefix}-${String(num).padStart(3, '0')}`;
};

router.use(authenticateToken);

router.get('/', requireRole(['ADMIN', 'DEVELOPER', 'OFFICER', 'RADIO_CENTER', 'EXECUTIVE']), async (req, res) => {
  try {
    const { month, year } = req.query;
    if (!month || !year) {
      return res.status(400).json({ error: 'month and year are required' });
    }

    const monthStr = String(month).padStart(2, '0');
    const yearStr = String(year);
    const likePattern = `${yearStr}-${monthStr}-%`;

    const shifts = await db.all<TeamShift>(
      'SELECT * FROM team_shifts WHERE shift_date LIKE $1',
      [likePattern]
    );

    const shiftIds = shifts.map(s => s.id);
    let assignments: TeamShiftAssignment[] = [];
    if (shiftIds.length > 0) {
      const placeholders = shiftIds.map((_, i) => `$${i + 1}`).join(', ');
      assignments = await db.all<TeamShiftAssignment>(
        `SELECT * FROM team_shift_assignments WHERE team_shift_id IN (${placeholders})`,
        shiftIds
      );
    }

    const assignmentMap: Record<string, TeamShiftAssignment[]> = {};
    for (const a of assignments) {
      if (!assignmentMap[a.team_shift_id]) assignmentMap[a.team_shift_id] = [];
      assignmentMap[a.team_shift_id].push({
        ...a,
        helper_ids: typeof a.helper_ids === 'string' ? JSON.parse(a.helper_ids) : a.helper_ids,
        properties: typeof a.properties === 'string' ? JSON.parse(a.properties) : a.properties,
      });
    }

    const result = shifts.map(s => ({
      id: s.id,
      teamId: s.team_id,
      date: s.shift_date,
      status: s.status,
      notes: s.notes,
      assignments: (assignmentMap[s.id] || []).map(a => ({
        id: a.id,
        vehicleId: a.vehicle_id,
        driverId: a.driver_id,
        helperIds: a.helper_ids,
        properties: a.properties,
      })),
    }));

    res.json(result);
  } catch (err: any) {
    console.error('Fetch team shifts error:', err);
    res.status(500).json({ error: err.message });
  }
});

router.post('/', requireRole(['ADMIN', 'DEVELOPER', 'OFFICER', 'RADIO_CENTER']), async (req, res) => {
  try {
    const { teamId, date, status, vehicleId } = req.body;
    if (!teamId || !date || !status) {
      return res.status(400).json({ error: 'teamId, date and status are required' });
    }

    const user = (req as any).user;
    const existing = await db.get<TeamShift>(
      'SELECT * FROM team_shifts WHERE team_id = $1 AND shift_date = $2',
      [teamId, date]
    );

    let shiftId = existing?.id;
    let shift: TeamShift | undefined = existing;

    if (!shift) {
      shiftId = await generateId('team_shifts', 'TSH');
      await db.insert('team_shifts', {
        id: shiftId,
        team_id: teamId,
        shift_date: date,
        status,
        created_by: user?.id || null,
      });
      shift = await db.get<TeamShift>('SELECT * FROM team_shifts WHERE id = $1', [shiftId]);
    } else {
      await db.update('team_shifts', shiftId!, { status });
      shift = await db.get<TeamShift>('SELECT * FROM team_shifts WHERE id = $1', [shiftId]);
    }

    if (!shift) {
      return res.status(500).json({ error: 'Failed to persist team shift' });
    }

    let assignment: TeamShiftAssignment | undefined;
    if (vehicleId) {
      const existingAssignments = await db.all<TeamShiftAssignment>(
        'SELECT * FROM team_shift_assignments WHERE team_shift_id = $1',
        [shift.id]
      );
      if (existingAssignments.length > 0) {
        const first = existingAssignments[0];
        await db.update('team_shift_assignments', first.id, {
          vehicle_id: vehicleId,
        });
        assignment = await db.get<TeamShiftAssignment>(
          'SELECT * FROM team_shift_assignments WHERE id = $1',
          [first.id]
        );
      } else {
        const assignId = await generateId('team_shift_assignments', 'TSA');
        await db.insert('team_shift_assignments', {
          id: assignId,
          team_shift_id: shift.id,
          vehicle_id: vehicleId,
        });
        assignment = await db.get<TeamShiftAssignment>(
          'SELECT * FROM team_shift_assignments WHERE id = $1',
          [assignId]
        );
      }
    } else {
      await db.run(
        'DELETE FROM team_shift_assignments WHERE team_shift_id = $1',
        [shift.id]
      );
    }

    res.status(201).json({
      id: shift.id,
      teamId: shift.team_id,
      date: shift.shift_date,
      status: shift.status,
      assignments: assignment
        ? [{
            id: assignment.id,
            vehicleId: assignment.vehicle_id,
            driverId: assignment.driver_id,
            helperIds: assignment.helper_ids,
            properties: assignment.properties,
          }]
        : [],
    });
  } catch (err: any) {
    console.error('Create/update team shift error:', err);
    res.status(500).json({ error: err.message });
  }
});

router.delete('/', requireRole(['ADMIN', 'DEVELOPER', 'OFFICER', 'RADIO_CENTER']), async (req, res) => {
  try {
    const { teamId, date } = req.body;
    if (!teamId || !date) {
      return res.status(400).json({ error: 'teamId and date are required' });
    }

    const existing = await db.get<TeamShift>(
      'SELECT * FROM team_shifts WHERE team_id = $1 AND shift_date = $2',
      [teamId, date]
    );
    if (!existing) {
      return res.status(204).send();
    }

    await db.run('DELETE FROM team_shift_assignments WHERE team_shift_id = $1', [existing.id]);
    await db.run('DELETE FROM team_shifts WHERE id = $1', [existing.id]);

    res.status(204).send();
  } catch (err: any) {
    console.error('Delete team shift error:', err);
    res.status(500).json({ error: err.message });
  }
});

export default router;

