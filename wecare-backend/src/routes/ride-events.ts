import express from 'express';
import { sqliteDB } from '../db/sqliteDB';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = express.Router();

export interface RideEvent {
    id: string | number;
    rideId: string;
    eventType: 'CREATED' | 'ASSIGNED' | 'EN_ROUTE' | 'ARRIVED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'NOTE' | 'LOCATION_UPDATE';
    timestamp: string;
    userId: string;
    userName: string;
    userRole: string;
    description: string;
    details?: any; // Not persisted in SQLite currently unless added to schema
    location?: {
        lat: number;
        lng: number;
    };
}

// GET /api/ride-events/:rideId - Get all events for a specific ride
router.get('/:rideId', authenticateToken, (req, res) => {
    try {
        const { rideId } = req.params;

        // Join with users to get name and role
        const rows = sqliteDB.all<any>(`
            SELECT 
                re.id,
                re.ride_id,
                re.event_type,
                re.timestamp,
                re.latitude,
                re.longitude,
                re.notes as description,
                re.created_by,
                u.full_name as user_name,
                u.role as user_role
            FROM ride_events re
            LEFT JOIN users u ON re.created_by = u.id
            WHERE re.ride_id = ?
            ORDER BY re.timestamp DESC
        `, [rideId]);

        const events: RideEvent[] = rows.map(row => ({
            id: row.id,
            rideId: row.ride_id,
            eventType: row.event_type as any,
            timestamp: row.timestamp,
            userId: row.created_by || 'system',
            userName: row.user_name || 'System',
            userRole: row.user_role || 'system',
            description: row.description || '',
            details: {}, // Not persisted
            location: (row.latitude && row.longitude) ? {
                lat: Number(row.latitude),
                lng: Number(row.longitude)
            } : undefined
        }));

        res.json(events);
    } catch (err: any) {
        console.error('Error fetching ride events:', err);
        res.status(500).json({ error: err.message });
    }
});

// POST /api/ride-events - Create a new event (internal use or manual notes)
router.post('/', authenticateToken, (req, res) => {
    try {
        const { rideId, eventType, description, details, location } = req.body;
        const currentUser = (req as any).user;

        if (!rideId || !eventType) {
            return res.status(400).json({ error: 'Missing required fields: rideId, eventType' });
        }

        const finalDescription = description || getDefaultDescription(eventType);
        const lat = location?.lat ? String(location.lat) : null;
        const lng = location?.lng ? String(location.lng) : null;
        const userId = currentUser?.id;

        const result = sqliteDB.prepare(`
            INSERT INTO ride_events (ride_id, event_type, timestamp, latitude, longitude, notes, created_by)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `).run(rideId, eventType, new Date().toISOString(), lat, lng, finalDescription, userId);

        const newEvent: RideEvent = {
            id: Number(result.lastInsertRowid),
            rideId,
            eventType,
            timestamp: new Date().toISOString(),
            userId: userId || 'system',
            userName: currentUser?.fullName || currentUser?.email || 'System',
            userRole: currentUser?.role || 'system',
            description: finalDescription,
            details: details || {},
            location
        };

        res.status(201).json(newEvent);
    } catch (err: any) {
        console.error('Error creating ride event:', err);
        res.status(500).json({ error: err.message });
    }
});

// Helper function for default descriptions
function getDefaultDescription(eventType: string): string {
    const descriptions: Record<string, string> = {
        'CREATED': 'สร้างคำขอเดินทางใหม่',
        'ASSIGNED': 'จ่ายงานให้คนขับ',
        'EN_ROUTE': 'คนขับกำลังเดินทางไปรับผู้ป่วย',
        'ARRIVED': 'คนขับถึงจุดรับผู้ป่วยแล้ว',
        'IN_PROGRESS': 'กำลังเดินทางไปจุดหมาย',
        'COMPLETED': 'เสร็จสิ้นการเดินทาง',
        'CANCELLED': 'ยกเลิกการเดินทาง',
        'NOTE': 'บันทึกเพิ่มเติม',
        'LOCATION_UPDATE': 'อัปเดตตำแหน่ง'
    };
    return descriptions[eventType] || eventType;
}

// Utility function to log ride events (to be called from other routes)
export function logRideEvent(
    rideId: string,
    eventType: RideEvent['eventType'],
    user: { id: string; email?: string; fullName?: string; role?: string },
    details?: any,
    description?: string,
    location?: { lat: number; lng: number }
): RideEvent {

    const finalDescription = description || getDefaultDescription(eventType);
    const lat = location?.lat ? String(location.lat) : null;
    const lng = location?.lng ? String(location.lng) : null;

    try {
        const result = sqliteDB.prepare(`
            INSERT INTO ride_events (ride_id, event_type, timestamp, latitude, longitude, notes, created_by)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `).run(rideId, eventType, new Date().toISOString(), lat, lng, finalDescription, user.id);

        return {
            id: Number(result.lastInsertRowid),
            rideId,
            eventType,
            timestamp: new Date().toISOString(),
            userId: user.id || 'system',
            userName: user.fullName || user.email || 'System',
            userRole: user.role || 'unknown',
            description: finalDescription,
            details: details || {},
            location
        };
    } catch (error) {
        console.error('Failed to log ride event:', error);
        // Return a temporary object even if DB fail, to prevent crashing main flow? 
        // Or throw? Usually logging failure shouldn't crash auth logic, but usually we want to know.
        // For now logging error and returning mock to allow continuation.
        return {
            id: 0,
            rideId,
            eventType,
            timestamp: new Date().toISOString(),
            userId: user.id,
            userName: user.fullName || 'unknown',
            userRole: user.role || 'unknown',
            description: finalDescription,
            details: details,
            location
        };
    }
}

export default router;
