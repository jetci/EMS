import express from 'express';
import { sqliteDB } from '../db/sqliteDB';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = express.Router();

export interface DriverLocation {
    driverId: string;
    driverName: string;
    latitude: number;
    longitude: number;
    status: 'AVAILABLE' | 'ON_TRIP' | 'OFFLINE';
    currentRideId?: string;
    lastUpdated: string;
    vehicleInfo?: {
        licensePlate: string;
        vehicleType: string;
    };
}

// GET /api/driver-locations - Get all active driver locations
router.get('/', authenticateToken, requireRole(['admin', 'DEVELOPER', 'OFFICER', 'radio', 'radio_center', 'EXECUTIVE']), (req, res) => {
    try {
        const rows = sqliteDB.all<any>(`
            SELECT 
                d.id, 
                d.full_name, 
                d.status, 
                l.latitude, 
                l.longitude, 
                l.timestamp as last_updated
            FROM drivers d
            LEFT JOIN driver_locations l ON d.id = l.driver_id
            WHERE d.status != 'INACTIVE'
        `);

        // Need to check for current active ride separately or via subquery
        // For now, simplify or do a second query if critical. 
        // Assuming currentRideId is needed.
        // Let's attach current active ride ID if any.

        const activeRides = sqliteDB.all<any>(`
            SELECT id, driver_id FROM rides 
            WHERE status IN ('ASSIGNED', 'EN_ROUTE_TO_PICKUP', 'ARRIVED_AT_PICKUP', 'IN_PROGRESS')
        `);

        const driverLocations: DriverLocation[] = rows.map((row: any) => {
            const activeRide = activeRides.find(r => r.driver_id === row.id);

            return {
                driverId: row.id,
                driverName: row.full_name,
                latitude: row.latitude || 19.9213, // Default fallback
                longitude: row.longitude || 99.2131,
                status: row.status || 'AVAILABLE',
                currentRideId: activeRide ? activeRide.id : null,
                lastUpdated: row.last_updated || new Date().toISOString(),
                vehicleInfo: {
                    licensePlate: row.license_plate || 'N/A',
                    vehicleType: row.vehicle_type || 'รถพยาบาล'
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
            // Update Location
            sqliteDB.prepare(`
                INSERT INTO driver_locations (driver_id, latitude, longitude, last_updated)
                VALUES (?, ?, ?, ?)
                ON CONFLICT(driver_id) DO UPDATE SET
                latitude = excluded.latitude,
                longitude = excluded.longitude,
                last_updated = excluded.last_updated
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
                l.latitude, 
                l.longitude, 
                l.timestamp as last_updated
            FROM drivers d
            LEFT JOIN driver_locations l ON d.id = l.driver_id
            WHERE d.id = ?
        `, [driverId]);

        if (!row) {
            return res.status(404).json({ error: 'Driver not found' });
        }

        // Active Ride Check
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
            currentRideId: activeRide ? activeRide.id : undefined, // Change from null to undefined to match optional property if stricter
            lastUpdated: row.last_updated || new Date().toISOString(),
            vehicleInfo: {
                licensePlate: row.license_plate || 'N/A',
                vehicleType: row.vehicle_type || 'รถพยาบาล'
            }
        };

        res.json(location);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
