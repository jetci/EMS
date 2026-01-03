import express from 'express';
import { jsonDB } from '../db/jsonDB';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = express.Router();

export interface RideEvent {
    id: string;
    rideId: string;
    eventType: 'CREATED' | 'ASSIGNED' | 'EN_ROUTE' | 'ARRIVED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'NOTE' | 'LOCATION_UPDATE';
    timestamp: string;
    userId: string;
    userName: string;
    userRole: string;
    description: string;
    details?: any;
    location?: {
        lat: number;
        lng: number;
    };
}

// GET /api/ride-events/:rideId - Get all events for a specific ride
router.get('/:rideId', authenticateToken, (req, res) => {
    try {
        const { rideId } = req.params;
        let events = jsonDB.read<RideEvent>('ride_events');

        // Filter by rideId
        events = events.filter(e => e.rideId === rideId);

        // Sort by timestamp (newest first)
        events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

        res.json(events);
    } catch (err: any) {
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

        const newId = jsonDB.generateId('ride_events', 'EVT');
        const newEvent: RideEvent = {
            id: newId,
            rideId,
            eventType,
            timestamp: new Date().toISOString(),
            userId: currentUser?.id || 'system',
            userName: currentUser?.fullName || currentUser?.email || 'System',
            userRole: currentUser?.role || 'system',
            description: description || getDefaultDescription(eventType),
            details: details || {},
            location
        };

        jsonDB.create('ride_events', newEvent);
        res.status(201).json(newEvent);
    } catch (err: any) {
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
    const newId = jsonDB.generateId('ride_events', 'EVT');
    const newEvent: RideEvent = {
        id: newId,
        rideId,
        eventType,
        timestamp: new Date().toISOString(),
        userId: user.id || 'system',
        userName: user.fullName || user.email || 'System',
        userRole: user.role || 'unknown',
        description: description || getDefaultDescription(eventType),
        details: details || {},
        location
    };

    jsonDB.create('ride_events', newEvent);
    return newEvent;
}

export default router;
