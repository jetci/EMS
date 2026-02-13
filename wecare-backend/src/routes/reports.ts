import express from 'express';
import { db } from '../db';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = express.Router();

const normalizeVillageList = (villages: any): string[] => {
    if (!villages) return [];
    if (Array.isArray(villages)) return villages.map(v => String(v)).filter(Boolean);
    if (typeof villages === 'string') {
        const raw = villages.trim();
        if (!raw) return [];
        try {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) return parsed.map(v => String(v)).filter(Boolean);
        } catch { }
        return raw.split(',').map(v => v.trim()).filter(Boolean);
    }
    return [];
};

// GET /api/office/reports/roster
router.get('/roster', authenticateToken, async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        let sql = `
            SELECT r.*, d.full_name as driver_name, v.license_plate 
            FROM rides r
            LEFT JOIN drivers d ON r.driver_id = d.id
            LEFT JOIN vehicles v ON r.vehicle_id = v.id
            WHERE 1=1
        `;
        const params: any[] = [];
        let pIndex = 1;

        if (startDate) {
            sql += ` AND r.appointment_time >= $${pIndex++}`;
            params.push(`${startDate}T00:00:00`);
        }
        if (endDate) {
            sql += ` AND r.appointment_time <= $${pIndex++}`;
            params.push(`${endDate}T23:59:59`);
        }

        sql += ' ORDER BY r.appointment_time ASC';

        const rides = await db.all(sql, params);
        res.json(rides);
    } catch (err: any) {
        console.error('Roster report error:', err);
        res.status(500).json({ error: err.message });
    }
});

// GET /api/office/reports/personnel
router.get('/personnel', authenticateToken, async (req, res) => {
    try {
        const { startDate, endDate, driverId } = req.query;

        let sql = `
            SELECT r.*, p.full_name as patient_name
            FROM rides r
            LEFT JOIN patients p ON r.patient_id = p.id
            WHERE 1=1
        `;
        const params: any[] = [];
        let pIndex = 1;

        if (startDate) {
            sql += ` AND r.appointment_time >= $${pIndex++}`;
            params.push(`${startDate}T00:00:00`);
        }
        if (endDate) {
            sql += ` AND r.appointment_time <= $${pIndex++}`;
            params.push(`${endDate}T23:59:59`);
        }
        if (driverId && driverId !== 'all') {
            sql += ` AND r.driver_id = $${pIndex++}`;
            params.push(driverId);
        }

        sql += ' ORDER BY r.appointment_time DESC';

        const rides = await db.all(sql, params);
        res.json(rides);
    } catch (err: any) {
        console.error('Personnel report error:', err);
        res.status(500).json({ error: err.message });
    }
});

// GET /api/office/reports/maintenance
router.get('/maintenance', authenticateToken, async (req, res) => {
    try {
        const { status } = req.query;
        let sql = 'SELECT * FROM vehicles WHERE 1=1';
        const params: any[] = [];
        let pIndex = 1;

        if (status === 'upcoming') {
            const today = new Date().toISOString().split('T')[0];
            // PostgreSQL interval syntax
            sql += ` AND next_maintenance_date >= $${pIndex++} AND next_maintenance_date <= ($${pIndex++}::date + interval '30 days')`;
            params.push(today, today);
        } else if (status === 'overdue') {
            const today = new Date().toISOString().split('T')[0];
            sql += ` AND next_maintenance_date < $${pIndex++}`;
            params.push(today);
        }

        sql += ' ORDER BY next_maintenance_date ASC';

        const vehicles = await db.all(sql, params);
        res.json(vehicles);
    } catch (err: any) {
        console.error('Maintenance report error:', err);
        res.status(500).json({ error: err.message });
    }
});

// GET /api/office/reports/patients
router.get('/patients', authenticateToken, async (req, res) => {
    try {
        const { startDate, endDate, villages } = req.query;
        let sql = 'SELECT * FROM patients WHERE deleted_at IS NULL';
        const params: any[] = [];
        let pIndex = 1;

        if (startDate) {
            sql += ` AND registered_date >= $${pIndex++}`;
            params.push(`${startDate}T00:00:00`);
        }
        if (endDate) {
            sql += ` AND registered_date <= $${pIndex++}`;
            params.push(`${endDate}T23:59:59`);
        }

        const patients = await db.all<any>(sql, params);

        // Filter villages in memory
        let filtered = patients;
        if (villages) {
            const villageList = normalizeVillageList(villages);
            filtered = patients.filter(p => {
                const addr = [
                    p.current_house_number,
                    p.current_village,
                    p.current_tambon,
                    p.current_amphoe,
                    p.current_changwat,
                    p.id_card_house_number,
                    p.id_card_village,
                    p.id_card_tambon,
                    p.id_card_amphoe,
                    p.id_card_changwat,
                ].filter(Boolean).join(' ');
                return villageList.some(v => addr.includes(v));
            });
        }

        res.json(filtered);
    } catch (err: any) {
        console.error('Patients report error:', err);
        res.status(500).json({ error: err.message });
    }
});

// GET /api/reports/export
router.get('/export', authenticateToken, requireRole(['EXECUTIVE', 'admin', 'DEVELOPER', 'OFFICER', 'radio_center']), async (req, res) => {
    try {
        const { type, format, startDate, endDate, driverId, status, villages } = req.query;

        let data: any[] = [];
        let filename = `report_${type}_${new Date().getTime()}`;

        if (type === 'detailed_rides') {
            let sql = 'SELECT * FROM rides WHERE 1=1';
            const params: any[] = [];
            let pIndex = 1;
            if (startDate) { sql += ` AND appointment_time >= $${pIndex++}`; params.push(`${startDate}T00:00:00`); }
            if (endDate) { sql += ` AND appointment_time <= $${pIndex++}`; params.push(`${endDate}T23:59:59`); }
            if (driverId && driverId !== 'all') { sql += ` AND driver_id = $${pIndex++}`; params.push(driverId); }

            data = await db.all(sql, params);
            filename = `rides_report_${new Date().toISOString().split('T')[0]}`;
        } else if (type === 'patient_by_village') {
            let sql = 'SELECT * FROM patients WHERE deleted_at IS NULL';
            const params: any[] = [];
            let pIndex = 1;
            if (startDate) { sql += ` AND registered_date >= $${pIndex++}`; params.push(`${startDate}T00:00:00`); }
            if (endDate) { sql += ` AND registered_date <= $${pIndex++}`; params.push(`${endDate}T23:59:59`); }
            const patients = await db.all<any>(sql, params);
            const villageList = normalizeVillageList(villages);
            data = villageList.length === 0 ? patients : patients.filter(p => {
                const addr = [
                    p.current_house_number,
                    p.current_village,
                    p.current_tambon,
                    p.current_amphoe,
                    p.current_changwat,
                    p.id_card_house_number,
                    p.id_card_village,
                    p.id_card_tambon,
                    p.id_card_amphoe,
                    p.id_card_changwat,
                ].filter(Boolean).join(' ');
                return villageList.some(v => addr.includes(v));
            });
            filename = `patients_report_${new Date().toISOString().split('T')[0]}`;
        } else if (type === 'maintenance') {
            let sql = 'SELECT * FROM vehicles WHERE 1=1';
            const params: any[] = [];
            let pIndex = 1;
            const filter = typeof status === 'string' ? status : 'all';
            if (filter === 'upcoming') {
                const today = new Date().toISOString().split('T')[0];
                sql += ` AND next_maintenance_date >= $${pIndex++} AND next_maintenance_date <= ($${pIndex++}::date + interval '30 days')`;
                params.push(today, today);
            } else if (filter === 'overdue') {
                const today = new Date().toISOString().split('T')[0];
                sql += ` AND next_maintenance_date < $${pIndex++}`;
                params.push(today);
            }
            sql += ' ORDER BY next_maintenance_date ASC';
            data = await db.all(sql, params);
            filename = `maintenance_report_${new Date().toISOString().split('T')[0]}`;
        } else {
            // Summary
            const ridesCount = await db.get<{ c: number }>('SELECT COUNT(*) as c FROM rides');
            const patientsCount = await db.get<{ c: number }>('SELECT COUNT(*) as c FROM patients WHERE deleted_at IS NULL');
            data = [
                { Metric: 'Total Rides', Value: Number(ridesCount?.c || 0) },
                { Metric: 'Total Patients', Value: Number(patientsCount?.c || 0) },
                { Metric: 'Efficiency', Value: '95%' }
            ];
            filename = `summary_report_${new Date().toISOString().split('T')[0]}`;
        }

        if (format === 'csv') {
            if (data.length === 0) {
                return res.status(404).json({ error: 'No data found for the selected period' });
            }

            const headers = Object.keys(data[0]);
            const csvRows = [
                headers.join(','),
                ...data.map(row => headers.map(fieldName => {
                    const val = row[fieldName];
                    return JSON.stringify(val === null || val === undefined ? '' : val);
                }).join(','))
            ];
            const csvContent = csvRows.join('\n');

            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', `attachment; filename=${filename}.csv`);
            return res.status(200).send(csvContent);
        }

        res.status(400).json({ error: 'Unsupported format. Please use CSV.' });

    } catch (err: any) {
        console.error('Export report error:', err);
        res.status(500).json({ error: err.message });
    }
});

export default router;
