import express from 'express';
import { sqliteDB } from '../db/sqliteDB';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = express.Router();

export interface DriverLocation {
    driverId: string;
    driverName: string;
    latitude: number;
    longitude: number;
    status: 'AVAILABLE' | 'ON_TRIP' | 'OFFLINE' | 'ON_DUTY' | 'OFF_DUTY' | 'UNAVAILABLE';
    currentRideId?: string;
    lastUpdated: string;
    vehicleInfo?: {
        licensePlate: string;
        vehicleType: string;
    };
}

// GET /api/driver-locations - Get all active driver locations
router.get('/', authenticateToken, requireRole(['admin', 'DEVELOPER', 'OFFICER', 'radio', 'radio_center', 'driver', 'EXECUTIVE']), (req, res) => {
    try {
        const rows = sqliteDB.all<any>(`
            SELECT 
                d.id,
                d.full_name,
                d.status,
                v.license_plate AS vehicle_license_plate,
                vt.name AS vehicle_type_name,
                l.latitude,
                l.longitude,
                l.timestamp
            FROM drivers d
            LEFT JOIN vehicles v ON d.current_vehicle_id = v.id
            LEFT JOIN vehicle_types vt ON v.vehicle_type_id = vt.id
            LEFT JOIN (
                SELECT driver_id, latitude, longitude, timestamp,
                       ROW_NUMBER() OVER (PARTITION BY driver_id ORDER BY timestamp DESC) as rn
                FROM driver_locations
            ) l ON d.id = l.driver_id AND l.rn = 1
            WHERE d.status != 'INACTIVE'
        `);

        const activeRides = sqliteDB.all<any>(`
            SELECT id, driver_id FROM rides 
            WHERE status IN ('ASSIGNED', 'EN_ROUTE_TO_PICKUP', 'ARRIVED_AT_PICKUP', 'IN_PROGRESS')
        `);

        const driverLocations: DriverLocation[] = rows.map((row: any) => {
            const activeRide = activeRides.find(r => r.driver_id === row.id);

            return {
                driverId: row.id,
                driverName: row.full_name,
                latitude: row.latitude || 19.9213,
                longitude: row.longitude || 99.2131,
                status: row.status || 'AVAILABLE',
                currentRideId: activeRide ? activeRide.id : null,
                lastUpdated: row.timestamp || new Date().toISOString(),
                vehicleInfo: {
                    licensePlate: row.vehicle_license_plate || 'N/A',
                    vehicleType: row.vehicle_type_name || 'รถพยาบาล'
                }
            };
        });

        res.json(driverLocations);
    } catch (err: any) {
        console.error('Error fetching driver locations:', err);
        res.status(500).json({ error: err.message });
    }
});

// PUT /api/driver-locations/:driverId - Update driver location (from Driver App)
router.put('/:driverId', authenticateToken, (req, res) => {
    try {
        const { driverId } = req.params;
        const { latitude, longitude, status } = req.body;

        // Validate required fields
        if (latitude === undefined || longitude === undefined) {
            return res.status(400).json({ error: 'Missing required fields: latitude, longitude' });
        }

        // Validate coordinate values
        const lat = Number(latitude);
        const lng = Number(longitude);

        if (
            Number.isNaN(lat) ||
            Number.isNaN(lng) ||
            !Number.isFinite(lat) ||
            !Number.isFinite(lng) ||
            lat < -90 || lat > 90 ||
            lng < -180 || lng > 180
        ) {
            return res.status(400).json({
                error: 'Invalid coordinates. Latitude must be between -90 and 90, longitude between -180 and 180'
            });
        }

        const lastUpdated = new Date().toISOString();

        // Perform UPSERT for location
        // Note: 'driver_locations' table schema must have PRIMARY KEY (driver_id)
        sqliteDB.transaction(() => {
            // Update Location (insert new record for history)
            sqliteDB.prepare(`
                INSERT INTO driver_locations (driver_id, latitude, longitude, timestamp)
                VALUES (?, ?, ?, ?)
            `).run(driverId, lat, lng, lastUpdated);

            // Update Status if provided
            if (status) {
                sqliteDB.prepare(`
                    UPDATE drivers 
                    SET status = ?, updated_at = CURRENT_TIMESTAMP 
                    WHERE id = ?
                `).run(status, driverId);
            }
        });

        const updateData = {
            driverId,
            latitude: lat,
            longitude: lng,
            lastUpdated
        };

        res.json({ success: true, location: updateData });
    } catch (err: any) {
        console.error('Error updating driver location:', err);
        res.status(500).json({ error: err.message });
    }
});

// GET /api/driver-locations/:driverId - Get specific driver location
router.get('/:driverId', authenticateToken, (req, res) => {
    try {
        const { driverId } = req.params;

        const row = sqliteDB.get<any>(`
            SELECT 
                d.id,
                d.full_name,
                d.status,
                v.license_plate AS vehicle_license_plate,
                vt.name AS vehicle_type_name,
                l.latitude,
                l.longitude,
                l.timestamp
            FROM drivers d
            LEFT JOIN vehicles v ON d.current_vehicle_id = v.id
            LEFT JOIN vehicle_types vt ON v.vehicle_type_id = vt.id
            LEFT JOIN (
                SELECT driver_id, latitude, longitude, timestamp,
                       ROW_NUMBER() OVER (PARTITION BY driver_id ORDER BY timestamp DESC) as rn
                FROM driver_locations
            ) l ON d.id = l.driver_id AND l.rn = 1
            WHERE d.id = ?
        `, [driverId]);

        if (!row) {
            return res.status(404).json({ error: 'Driver not found' });
        }

        const activeRide = sqliteDB.get<any>(`
            SELECT id FROM rides 
            WHERE driver_id = ? AND status IN ('ASSIGNED', 'EN_ROUTE_TO_PICKUP', 'ARRIVED_AT_PICKUP', 'IN_PROGRESS')
        `, [driverId]);

        const location: DriverLocation = {
            driverId: row.id,
            driverName: row.full_name,
            latitude: row.latitude || 19.9213,
            longitude: row.longitude || 99.2131,
            status: row.status || 'AVAILABLE',
            currentRideId: activeRide ? activeRide.id : undefined,
            lastUpdated: row.timestamp || new Date().toISOString(),
            vehicleInfo: {
                licensePlate: row.vehicle_license_plate || 'N/A',
                vehicleType: row.vehicle_type_name || 'รถพยาบาล'
            }
        };

        res.json(location);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
