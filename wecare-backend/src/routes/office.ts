import express from 'express';
import { authenticateToken, AuthRequest, requireRole } from '../middleware/auth';
import { sqliteDB } from '../db/sqliteDB';
import { auditService } from '../services/auditService';
import { logRideEvent } from './ride-events';

const router = express.Router();

// Apply RBAC to all office routes
router.use(authenticateToken, requireRole(['radio_center', 'OFFICER', 'admin', 'DEVELOPER']));

// GET /api/office/dashboard - Dashboard Stats
router.get('/dashboard', async (req, res) => {
    try {
        const today = new Date().toISOString().split('T')[0];

        // SQLite uses COUNT for efficiency
        const stats = sqliteDB.get<any>(`
            SELECT
                (SELECT COUNT(*) FROM rides WHERE appointment_time LIKE '${today}%') as total_today_rides,
                (SELECT COUNT(*) FROM drivers WHERE status = 'AVAILABLE') as available_drivers,
                (SELECT COUNT(*) FROM drivers) as total_drivers,
                (SELECT COUNT(*) FROM rides WHERE status = 'PENDING') as pending_requests,
                (SELECT COUNT(*) FROM rides WHERE status IN ('EN_ROUTE_TO_PICKUP', 'ARRIVED_AT_PICKUP', 'IN_PROGRESS', 'ASSIGNED')) as active_rides,
                (SELECT COUNT(*) FROM patients) as total_patients
        `);

        res.json(stats);
    } catch (err: any) {
        console.error('Error fetching office dashboard stats:', err);
        res.status(500).json({ error: err.message });
    }
});

// GET /api/office/rides/urgent - Urgent/Pending Rides
router.get('/rides/urgent', async (req, res) => {
    try {
        // Urgent rides are PENDING rides, sorted by appointment time
        const rows = sqliteDB.all<any>(`
            SELECT
                r.*,
                COALESCE(r.village, p.current_village) as village,
                COALESCE(r.landmark, p.landmark) as landmark
            FROM rides r
            LEFT JOIN patients p ON r.patient_id = p.id
            WHERE r.status = 'PENDING'
            ORDER BY r.appointment_time ASC
        `);

        const rides = rows.map(r => ({
            ...r,
            special_needs: r.special_needs ? JSON.parse(r.special_needs) : []
        }));

        res.json({ rides });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/office/rides/today - Today's Schedule
router.get('/rides/today', async (req, res) => {
    try {
        const today = new Date().toISOString().split('T')[0];

        const rows = sqliteDB.all<any>(`
            SELECT
                r.*,
                COALESCE(r.village, p.current_village) as village,
                COALESCE(r.landmark, p.landmark) as landmark
            FROM rides r
            LEFT JOIN patients p ON r.patient_id = p.id
            WHERE r.appointment_time LIKE '${today}%'
            ORDER BY r.appointment_time ASC
        `);

        // Use same mapping strategy
        const rides = rows.map(r => ({
            ...r,
            special_needs: r.special_needs ? JSON.parse(r.special_needs) : []
        }));

        res.json({ rides });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/office/rides/:id/assign - Assign Driver
router.post('/rides/:id/assign', async (req, res) => {
    const { id } = req.params;
    const { driver_id } = req.body;

    if (!driver_id) {
        return res.status(400).json({ error: 'driver_id is required' });
    }

    try {
        const currentUser = (req as AuthRequest).user!;

        // Use Transaction for Atomicity
        const result = sqliteDB.transaction(() => {
            // 1. Check Ride Existence
            const ride = sqliteDB.get<any>('SELECT * FROM rides WHERE id = ?', [id]);
            if (!ride) throw new Error('Ride not found');

            // 2. Check Driver Existence & Availability
            const driver = sqliteDB.get<any>('SELECT * FROM drivers WHERE id = ?', [driver_id]);
            if (!driver) throw new Error('Driver not found');

            if (driver.status !== 'AVAILABLE') {
                throw new Error(`Driver not available (Status: ${driver.status})`);
            }

            // 3. Check if driver is already assigned (Double check via Active Rides)
            const activeRide = sqliteDB.get<any>(`
                SELECT id FROM rides
                WHERE driver_id = ? AND status IN ('ASSIGNED', 'EN_ROUTE_TO_PICKUP', 'ARRIVED_AT_PICKUP', 'IN_PROGRESS')
            `, [driver_id]);

            if (activeRide) {
                throw new Error(`Driver is already assigned to active ride ${activeRide.id}`);
            }

            // 4. Update Ride
            sqliteDB.prepare(`
                UPDATE rides
                SET driver_id = ?, driver_name = ?, status = 'ASSIGNED', updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            `).run(driver_id, driver.full_name, id);

            // 5. Update Driver Status
            sqliteDB.prepare(`
                UPDATE drivers
                SET status = 'ON_DUTY', updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            `).run(driver_id);

            return { ride, driver };
        });

        // 6. Post-transaction logging (Non-blocking or strictly handled)
        // Audit Log
        auditService.log(
            currentUser.email || 'unknown',
            currentUser.role || 'unknown',
            'ASSIGN_DRIVER',
            id,
            { driver_id, driver_name: result.driver.full_name }
        );

        // Ride Event
        logRideEvent(
            id,
            'ASSIGNED',
            { id: currentUser.id || '', email: currentUser.email, fullName: currentUser.email, role: currentUser.role },
            { driver_id, driver_name: result.driver.full_name },
            `จ่ายงานให้ ${result.driver.full_name}`
        );

        try {
            const io = (req as any).app?.get?.('io');
            if (io) {
                const ns = io.of('/locations');
                const message = `✅ จ่ายงาน ${id} ให้ ${result.driver.full_name}`;
                const payload = { eventType: 'ride_status', type: 'success', message, rideId: id, status: 'ASSIGNED' };
                ns.to('role:radio_center').emit('notification:new', payload);
                ns.to('role:OFFICER').emit('notification:new', payload);
                ns.to('role:admin').emit('notification:new', payload);
                ns.to('role:DEVELOPER').emit('notification:new', payload);
            }
        } catch { }

        res.json({ success: true, message: 'Driver assigned successfully', rideId: id, driverName: result.driver.full_name });

    } catch (err: any) {
        console.error('Error assigning driver:', err);
        const status = err.message.includes('not found') ? 404 : 400;
        res.status(status).json({ error: err.message });
    }
});

export default router;

