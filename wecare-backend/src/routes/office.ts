import express from 'express';
import { authenticateToken, AuthRequest, requireRole } from '../middleware/auth';
import { jsonDB } from '../db/jsonDB';
import { auditService } from '../services/auditService';
import { logRideEvent } from './ride-events';

const router = express.Router();

// Interfaces
interface Ride {
    id: string;
    status: string;
    appointment_time?: string;
    driver_id?: string;
    [key: string]: any;
}

interface Driver {
    id: string;
    status: string;
    [key: string]: any;
}

// Apply RBAC to all office routes
router.use(authenticateToken, requireRole(['radio_center', 'radio', 'OFFICER', 'admin', 'DEVELOPER']));

// GET /api/office/dashboard - Dashboard Stats
router.get('/dashboard', async (req, res) => {
    try {
        const rides = jsonDB.read<Ride>('rides');
        const drivers = jsonDB.read<Driver>('drivers');

        // Calculate stats
        const today = new Date().toISOString().split('T')[0];
        const todayRides = rides.filter(r => r.appointment_time?.startsWith(today));

        const stats = {
            total_today_rides: todayRides.length,
            available_drivers: drivers.filter(d => d.status === 'AVAILABLE').length,
            total_drivers: drivers.length,
            pending_requests: rides.filter(r => r.status === 'PENDING').length,
            active_rides: rides.filter(r => ['EN_ROUTE_TO_PICKUP', 'ARRIVED_AT_PICKUP', 'IN_PROGRESS'].includes(r.status)).length,
            total_patients: jsonDB.read('patients').length
        };

        res.json(stats);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/office/rides/urgent - Urgent/Pending Rides
router.get('/rides/urgent', async (req, res) => {
    try {
        const rides = jsonDB.read<Ride>('rides');
        // Urgent rides are PENDING rides, sorted by appointment time
        const urgentRides = rides
            .filter(r => r.status === 'PENDING')
            .sort((a, b) => (a.appointment_time || '').localeCompare(b.appointment_time || ''));

        // Map to frontend format if needed (or frontend handles it)
        // For now return raw data, frontend service might map it
        res.json({ rides: urgentRides });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/office/rides/today - Today's Schedule
router.get('/rides/today', async (req, res) => {
    try {
        const rides = jsonDB.read<Ride>('rides');
        const today = new Date().toISOString().split('T')[0];

        const todaysRides = rides
            .filter(r => r.appointment_time?.startsWith(today))
            .sort((a, b) => (a.appointment_time || '').localeCompare(b.appointment_time || ''));

        res.json({ rides: todaysRides });
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
        const ride = jsonDB.findById<Ride>('rides', id);
        if (!ride) {
            return res.status(404).json({ error: 'Ride not found' });
        }

        const driver = jsonDB.findById<Driver>('drivers', driver_id);
        if (!driver) {
            return res.status(404).json({ error: 'Driver not found' });
        }

        // ✅ FIX BUG-006: Check driver availability to prevent race condition
        if (driver.status !== 'AVAILABLE') {
            return res.status(400).json({
                error: 'Driver not available',
                details: `Driver is currently ${driver.status}. Please select an available driver.`
            });
        }

        // ✅ FIX BUG-006: Check if driver is already assigned to another active ride
        const rides = jsonDB.read<Ride>('rides');
        const driverActiveRide = rides.find(r =>
            r.driver_id === driver_id &&
            ['ASSIGNED', 'EN_ROUTE_TO_PICKUP', 'ARRIVED_AT_PICKUP', 'IN_PROGRESS'].includes(r.status)
        );

        if (driverActiveRide) {
            return res.status(400).json({
                error: 'Driver already assigned',
                details: `Driver is already assigned to ride ${driverActiveRide.id}`
            });
        }

        // Update Ride
        const updatedRide = jsonDB.update<Ride>('rides', id, {
            driver_id,
            status: 'ASSIGNED',
            driver_name: driver.full_name || driver.fullName
        });

        // ✅ FIX BUG-006: Update driver status to prevent concurrent assignment
        jsonDB.update<Driver>('drivers', driver_id, {
            status: 'ON_DUTY'
        });

        // Audit Log
        if ((req as AuthRequest).user) {
            const user = (req as AuthRequest).user!;
            auditService.log(
                user.email || 'unknown',
                user.role || 'unknown',
                'ASSIGN_DRIVER',
                id,
                { driver_id, driver_name: driver.full_name || driver.fullName }
            );

            // Ride Event Timeline
            logRideEvent(
                id,
                'ASSIGNED',
                { id: user.id || '', email: user.email, fullName: user.email, role: user.role },
                { driver_id, driver_name: driver.full_name || driver.fullName },
                `จ่ายงานให้ ${driver.full_name || driver.fullName}`
            );
        }

        res.json(updatedRide);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
