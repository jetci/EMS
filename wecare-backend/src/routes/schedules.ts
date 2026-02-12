
import express from 'express';
import { sqliteDB } from '../db/sqliteDB';
import { authenticateToken, AuthRequest, requireRole } from '../middleware/auth';
import { transformResponse } from '../utils/caseConverter';
import crypto from 'crypto';

const router = express.Router();

// Apply authentication
router.use(authenticateToken);

// GET /api/schedules - Get schedules by month (YYYY-MM) and optional team_id
router.get('/', async (req: AuthRequest, res) => {
    try {
        const { month, teamId } = req.query;

        if (!month) {
            return res.status(400).json({ error: 'Month parameter specific (YYYY-MM) is required' });
        }

        let sql = `
            SELECT ts.*, t.name as team_name, v.license_plate as vehicle_license_plate 
            FROM team_schedules ts
            LEFT JOIN teams t ON ts.team_id = t.id
            LEFT JOIN vehicles v ON ts.vehicle_id = v.id
            WHERE ts.date LIKE ?
        `;
        const params: any[] = [`${month}%`];

        if (teamId) {
            sql += ` AND ts.team_id = ?`;
            params.push(teamId);
        }

        const schedules = sqliteDB.all<any>(sql, params);

        // Transform for frontend
        const transformed = schedules.map(s => transformResponse(s));

        res.json(transformed);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/schedules - Create or Update schedule entry (Upsert)
router.post('/', requireRole(['admin', 'OFFICER', 'radio_center', 'EXECUTIVE']), async (req: AuthRequest, res) => {
    try {
        const { teamId, date, status, vehicleId, shiftType } = req.body;

        if (!teamId || !date || !status) {
            return res.status(400).json({ error: 'Missing required fields: teamId, date, status' });
        }

        // Check if entry exists
        const existing = sqliteDB.get<any>(
            'SELECT id FROM team_schedules WHERE team_id = ? AND date = ?',
            [teamId, date]
        );

        if (existing) {
            // Update
            sqliteDB.update('team_schedules', existing.id, {
                status,
                vehicle_id: vehicleId || null,
                shift_type: shiftType || '24H',
                updated_at: new Date().toISOString()
            });
            res.json({ message: 'Schedule updated', id: existing.id });
        } else {
            // Create
            const newId = `TS-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
            sqliteDB.insert('team_schedules', {
                id: newId,
                team_id: teamId,
                date,
                status,
                vehicle_id: vehicleId || null,
                shift_type: shiftType || '24H',
                created_at: new Date().toISOString()
            });
            res.status(201).json({ message: 'Schedule created', id: newId });
        }

    } catch (err: any) {
        console.error('Error saving schedule:', err);
        res.status(500).json({ error: err.message });
    }
});

// DELETE /api/schedules - Delete schedule (Clear shift)
router.delete('/', requireRole(['admin', 'OFFICER', 'radio_center']), async (req: AuthRequest, res) => {
    try {
        const { teamId, date } = req.body;

        if (!teamId || !date) {
            // Try getting from query if not in body
            const qTeamId = req.query.teamId;
            const qDate = req.query.date;
            if (qTeamId && qDate) {
                sqliteDB.db.prepare('DELETE FROM team_schedules WHERE team_id = ? AND date = ?').run(qTeamId, qDate);
                return res.status(204).send();
            }
            return res.status(400).json({ error: 'Missing teamId and date' });
        }

        sqliteDB.db.prepare('DELETE FROM team_schedules WHERE team_id = ? AND date = ?').run(teamId, date);
        res.status(204).send();
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
