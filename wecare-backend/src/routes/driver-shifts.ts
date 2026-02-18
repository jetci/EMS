import express from 'express';
import { authenticateToken, requireRole } from '../middleware/auth';
import { db } from '../db';

const router = express.Router();

interface DriverShift {
  id: string;
  driver_id: string;
  shift_date: string;
  status: string;
  notes?: string;
  created_by?: string;
}

const generateId = async (): Promise<string> => {
  const rows = await db.all<{ id: string }>('SELECT id FROM driver_shifts ORDER BY id DESC LIMIT 1');
  if (rows.length === 0) return 'DSH-001';
  const last = rows[0].id;
  const num = parseInt(last.split('-')[1]) + 1;
  return `DSH-${String(num).padStart(3, '0')}`;
};

router.use(authenticateToken);

router.get('/', requireRole(['ADMIN', 'DEVELOPER', 'OFFICER', 'RADIO_CENTER', 'EXECUTIVE']), async (req, res) => {
  try {
    const { weekStart } = req.query;
    if (!weekStart || typeof weekStart !== 'string') {
      return res.status(400).json({ error: 'weekStart is required (YYYY-MM-DD)' });
    }

    const start = weekStart;
    const end = weekStart; // frontend will request only one week; use >= start AND <= start + 6 in SQL if needed

    const rows = await db.all<DriverShift>(
      'SELECT * FROM driver_shifts WHERE shift_date >= $1 AND shift_date <= $1',
      [start]
    );

    const result = rows.map(r => ({
      id: r.id,
      driverId: r.driver_id,
      date: r.shift_date,
      status: r.status,
      notes: r.notes,
    }));

    res.json(result);
  } catch (err: any) {
    console.error('Fetch driver shifts error:', err);
    res.status(500).json({ error: err.message });
  }
});

router.post('/', requireRole(['ADMIN', 'DEVELOPER', 'OFFICER', 'RADIO_CENTER']), async (req, res) => {
  try {
    const { driverId, date, status } = req.body;
    if (!driverId || !date || !status) {
      return res.status(400).json({ error: 'driverId, date and status are required' });
    }

    const user = (req as any).user;

    const existing = await db.get<DriverShift>(
      'SELECT * FROM driver_shifts WHERE driver_id = $1 AND shift_date = $2',
      [driverId, date]
    );

    let id = existing?.id;
    let record: DriverShift | undefined = existing;

    if (!record) {
      id = await generateId();
      await db.insert('driver_shifts', {
        id,
        driver_id: driverId,
        shift_date: date,
        status,
        created_by: user?.id || null,
      });
      record = await db.get<DriverShift>('SELECT * FROM driver_shifts WHERE id = $1', [id]);
    } else {
      await db.update('driver_shifts', id!, { status });
      record = await db.get<DriverShift>('SELECT * FROM driver_shifts WHERE id = $1', [id]);
    }

    if (!record) {
      return res.status(500).json({ error: 'Failed to persist driver shift' });
    }

    res.status(201).json({
      id: record.id,
      driverId: record.driver_id,
      date: record.shift_date,
      status: record.status,
      notes: record.notes,
    });
  } catch (err: any) {
    console.error('Create/update driver shift error:', err);
    res.status(500).json({ error: err.message });
  }
});

router.delete('/', requireRole(['ADMIN', 'DEVELOPER', 'OFFICER', 'RADIO_CENTER']), async (req, res) => {
  try {
    const { driverId, date } = req.body;
    if (!driverId || !date) {
      return res.status(400).json({ error: 'driverId and date are required' });
    }

    const existing = await db.get<DriverShift>(
      'SELECT * FROM driver_shifts WHERE driver_id = $1 AND shift_date = $2',
      [driverId, date]
    );
    if (!existing) {
      return res.status(204).send();
    }

    await db.run('DELETE FROM driver_shifts WHERE id = $1', [existing.id]);

    res.status(204).send();
  } catch (err: any) {
    console.error('Delete driver shift error:', err);
    res.status(500).json({ error: err.message });
  }
});

export default router;

