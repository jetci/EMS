import express from 'express';
import { jsonDB } from '../db/jsonDB';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = express.Router();

// GET /api/office/reports/roster
router.get('/roster', authenticateToken, async (req, res) => {
    try {
        const { startDate, endDate, teamId } = req.query;
        const rides = jsonDB.read<any>('rides');
        const filtered = rides.filter((r: any) => {
            const date = r.appointment_time?.split('T')[0];
            const isDateInRange = (!startDate || date >= (startDate as string)) && (!endDate || date <= (endDate as string));
            const isTeamMatch = !teamId || teamId === 'all' || r.team_id === teamId;
            return isDateInRange && isTeamMatch;
        });
        res.json(filtered);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/office/reports/personnel
router.get('/personnel', authenticateToken, async (req, res) => {
    try {
        const { startDate, endDate, driverId } = req.query;
        const rides = jsonDB.read<any>('rides');
        const filtered = rides.filter((r: any) => {
            const date = r.appointment_time?.split('T')[0];
            const isDateInRange = (!startDate || date >= (startDate as string)) && (!endDate || date <= (endDate as string));
            const isDriverMatch = !driverId || driverId === 'all' || r.driver_id === driverId;
            return isDateInRange && isDriverMatch;
        });
        res.json(filtered);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/office/reports/maintenance
router.get('/maintenance', authenticateToken, async (req, res) => {
    try {
        const { status } = req.query;
        const vehicles = jsonDB.read<any>('vehicles');
        // Simple filter logic (can be expanded)
        let filtered = vehicles;
        if (status === 'upcoming') {
            // Mock logic: filter vehicles with next maintenance within 30 days
            const today = new Date();
            const next30Days = new Date();
            next30Days.setDate(today.getDate() + 30);
            filtered = vehicles.filter((v: any) => v.nextMaintenanceDate && new Date(v.nextMaintenanceDate) <= next30Days && new Date(v.nextMaintenanceDate) >= today);
        } else if (status === 'overdue') {
            const today = new Date();
            filtered = vehicles.filter((v: any) => v.nextMaintenanceDate && new Date(v.nextMaintenanceDate) < today);
        }
        res.json(filtered);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/office/reports/patients
router.get('/patients', authenticateToken, async (req, res) => {
    try {
        const { startDate, endDate, villages } = req.query;
        const patients = jsonDB.read<any>('patients');
        const villageList = (villages as string)?.split(',') || [];

        const filtered = patients.filter((p: any) => {
            const date = p.registered_date;
            const isDateInRange = (!startDate || date >= (startDate as string)) && (!endDate || date <= (endDate as string));
            // Simple address check for village
            const isVillageMatch = villageList.length === 0 || villageList.some(v => p.address?.includes(v));
            return isDateInRange && isVillageMatch;
        });
        res.json(filtered);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/reports/export
router.get('/export', authenticateToken, requireRole(['EXECUTIVE', 'admin', 'DEVELOPER']), async (req, res) => {
    try {
        const { type, format, startDate, endDate } = req.query;

        let data: any[] = [];
        let filename = `report_${type}_${new Date().getTime()}`;

        if (type === 'detailed_rides') {
            data = jsonDB.read<any>('rides');
            if (startDate || endDate) {
                const start = startDate ? new Date(startDate as string) : new Date(0);
                const end = endDate ? new Date(endDate as string) : new Date();
                data = data.filter(r => {
                    const d = new Date(r.appointment_time || r.appointmentTime);
                    return d >= start && d <= end;
                });
            }
            filename = `rides_report_${new Date().toISOString().split('T')[0]}`;
        } else if (type === 'patient_by_village') {
            data = jsonDB.read<any>('patients');
            filename = `patients_report_${new Date().toISOString().split('T')[0]}`;
        } else {
            // Summary report
            const rides = jsonDB.read<any>('rides');
            const patients = jsonDB.read<any>('patients');
            data = [
                { Metric: 'Total Rides', Value: rides.length },
                { Metric: 'Total Patients', Value: patients.length },
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
        res.status(500).json({ error: err.message });
    }
});

export default router;
