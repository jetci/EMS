import express from 'express';
import { authenticateToken, AuthRequest, requireRole } from '../middleware/auth';
import { db } from '../db';
import { auditService } from '../services/auditService';
import { logRideEvent } from './ride-events';
import { notifyOperationalRoles } from '../utils/socketNotifier';

const router = express.Router();

// Apply RBAC to all office routes
router.use(authenticateToken, requireRole(['radio_center', 'OFFICER', 'admin', 'DEVELOPER']));

// GET /api/office/dashboard - Dashboard Stats
router.get('/dashboard', async (req, res) => {
    try {
        const today = new Date().toISOString().split('T')[0];

        // PostgreSQL optimized query using CTE or subqueries
        const stats = await db.get<any>(`
            SELECT
                (SELECT COUNT(*) FROM rides WHERE appointment_time LIKE $1 || '%') as total_today_rides,
                (SELECT COUNT(*) FROM drivers WHERE status = 'AVAILABLE') as available_drivers,
                (SELECT COUNT(*) FROM drivers) as total_drivers,
                (SELECT COUNT(*) FROM rides WHERE status = 'PENDING') as pending_requests,
                (SELECT COUNT(*) FROM rides WHERE status IN ('EN_ROUTE_TO_PICKUP', 'ARRIVED_AT_PICKUP', 'IN_PROGRESS', 'ASSIGNED')) as active_rides,
                (SELECT COUNT(*) FROM patients WHERE deleted_at IS NULL) as total_patients
        `, [today]);

        res.json(stats);
    } catch (err: any) {
        console.error('Error fetching office dashboard stats:', err);
        res.status(500).json({ error: err.message });
    }
});

// GET /api/office/rides/urgent - Urgent/Pending Rides
router.get('/rides/urgent', async (req, res) => {
    try {
        const rows = await db.all<any>(`
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
            special_needs: typeof r.special_needs === 'string' ? JSON.parse(r.special_needs) : (r.special_needs || [])
        }));

        res.json({ rides });
    } catch (err: any) {
        console.error('Fetch urgent rides error:', err);
        res.status(500).json({ error: err.message });
    }
});

// GET /api/office/rides/today - Today's Schedule
router.get('/rides/today', async (req, res) => {
    try {
        const today = new Date().toISOString().split('T')[0];

        const rows = await db.all<any>(`
            SELECT
                r.*,
                COALESCE(r.village, p.current_village) as village,
                COALESCE(r.landmark, p.landmark) as landmark
            FROM rides r
            LEFT JOIN patients p ON r.patient_id = p.id
            WHERE r.appointment_time LIKE $1 || '%'
            ORDER BY r.appointment_time ASC
        `, [today]);

        const rides = rows.map(r => ({
            ...r,
            special_needs: typeof r.special_needs === 'string' ? JSON.parse(r.special_needs) : (r.special_needs || [])
        }));

        res.json({ rides });
    } catch (err: any) {
        console.error('Fetch today schedule error:', err);
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

        // Use PostgreSQL Transaction
        const result = await db.transaction(async (client) => {
            // 1. Check Ride Existence
            const rideRes = await client.query('SELECT * FROM rides WHERE id = $1', [id]);
            const ride = rideRes.rows[0];
            if (!ride) throw new Error('Ride not found');

            // 2. Check Driver Existence & Availability
            const driverRes = await client.query('SELECT * FROM drivers WHERE id = $1', [driver_id]);
            const driver = driverRes.rows[0];
            if (!driver) throw new Error('Driver not found');

            if (driver.status !== 'AVAILABLE') {
                throw new Error(`Driver not available (Status: ${driver.status})`);
            }

            // 3. Check for active rides
            const activeRideRes = await client.query(`
                SELECT id FROM rides
                WHERE driver_id = $1 AND status IN ('ASSIGNED', 'EN_ROUTE_TO_PICKUP', 'ARRIVED_AT_PICKUP', 'IN_PROGRESS')
            `, [driver_id]);

            if (activeRideRes.rows.length > 0) {
                throw new Error(`Driver is already assigned to active ride ${activeRideRes.rows[0].id}`);
            }

            // 4. Update Ride
            await client.query(`
                UPDATE rides
                SET driver_id = $1, driver_name = $2, status = 'ASSIGNED', updated_at = CURRENT_TIMESTAMP
                WHERE id = $3
            `, [driver_id, driver.full_name, id]);

            // 5. Update Driver Status
            await client.query(`
                UPDATE drivers
                SET status = 'ON_DUTY', updated_at = CURRENT_TIMESTAMP
                WHERE id = $1
            `, [driver_id]);

            return { ride, driver };
        });

        // 6. Post-transaction logging
        await auditService.log(
            currentUser.email || 'unknown',
            currentUser.role || 'unknown',
            'ASSIGN_DRIVER',
            id,
            { driver_id, driver_name: result.driver.full_name }
        );

        logRideEvent(
            id,
            'ASSIGNED',
            { id: currentUser.id || '', email: currentUser.email, fullName: currentUser.email, role: currentUser.role },
            { driver_id, driver_name: result.driver.full_name },
            `จ่ายงานให้ ${result.driver.full_name}`
        );

        // Socket notification
        try {
            const io = (req as any).app?.get?.('io');
            if (io) {
                const ns = io.of('/locations');
                const message = `✅ จ่ายงาน ${id} ให้ ${result.driver.full_name}`;
                notifyOperationalRoles(ns, {
                    eventType: 'ride_status',
                    type: 'success',
                    message,
                    rideId: id,
                    status: 'ASSIGNED'
                });
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

