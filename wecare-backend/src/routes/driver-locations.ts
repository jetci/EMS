import express from 'express';
import { jsonDB } from '../db/jsonDB';
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
router.get('/', authenticateToken, requireRole(['admin', 'DEVELOPER', 'OFFICER', 'radio', 'radio_center']), (req, res) => {
    try {
        const drivers = jsonDB.read<any>('drivers');
        const locations = jsonDB.read<any>('driver_locations');

        const driverLocations: DriverLocation[] = drivers
            .filter((d: any) => d.status !== 'INACTIVE')
            .map((driver: any) => {
                const loc = locations.find((l: any) => l.driverId === driver.id);

                return {
                    driverId: driver.id,
                    driverName: driver.fullName,
                    latitude: loc ? loc.latitude : 19.9213,
                    longitude: loc ? loc.longitude : 99.2131,
                    status: driver.status || 'AVAILABLE',
                    currentRideId: driver.currentRideId || null,
                    lastUpdated: loc ? loc.lastUpdated : new Date().toISOString(),
                    vehicleInfo: {
                        licensePlate: driver.licensePlate || 'N/A',
                        vehicleType: driver.vehicleType || 'รถพยาบาล'
                    }
                };
            });

        res.json(driverLocations);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// PUT /api/driver-locations/:driverId - Update driver location (from Driver App)
router.put('/:driverId', authenticateToken, (req, res) => {
    try {
        const { driverId } = req.params;
        const { latitude, longitude, status } = req.body;

        if (latitude === undefined || longitude === undefined) {
            return res.status(400).json({ error: 'Missing required fields: latitude, longitude' });
        }

        const locations = jsonDB.read<any>('driver_locations');
        const existingIndex = locations.findIndex((l: any) => l.driverId === driverId);

        const updateData = {
            driverId,
            latitude,
            longitude,
            lastUpdated: new Date().toISOString()
        };

        if (existingIndex >= 0) {
            locations[existingIndex] = { ...locations[existingIndex], ...updateData };
        } else {
            locations.push(updateData);
        }

        // Save back to DB
        jsonDB.write('driver_locations', locations);

        // Also update driver status in drivers.json if provided
        if (status) {
            jsonDB.update<any>('drivers', driverId, { status });
        }

        res.json({ success: true, location: updateData });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/driver-locations/:driverId - Get specific driver location
router.get('/:driverId', authenticateToken, (req, res) => {
    try {
        const { driverId } = req.params;
        const drivers = jsonDB.read<any>('drivers');
        const driver = drivers.find((d: any) => d.id === driverId);

        if (!driver) {
            return res.status(404).json({ error: 'Driver not found' });
        }

        const locations = jsonDB.read<any>('driver_locations');
        const loc = locations.find((l: any) => l.driverId === driverId);

        const location: DriverLocation = {
            driverId: driver.id,
            driverName: driver.fullName,
            latitude: loc ? loc.latitude : 19.9213,
            longitude: loc ? loc.longitude : 99.2131,
            status: driver.status || 'AVAILABLE',
            lastUpdated: loc ? loc.lastUpdated : new Date().toISOString(),
            vehicleInfo: {
                licensePlate: driver.licensePlate || 'N/A',
                vehicleType: driver.vehicleType || 'รถพยาบาล'
            }
        };

        res.json(location);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
