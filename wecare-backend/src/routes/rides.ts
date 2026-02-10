import express from 'express';
import { sqliteDB } from '../db/sqliteDB';
import { optionalAuth, AuthRequest, authenticateToken, requireRole } from '../middleware/auth';
import { auditService } from '../services/auditService';
import { logRideEvent } from './ride-events';
import { checkDuplicateRide } from '../middleware/idempotency';
import { parsePaginationParams, createPaginatedResponse } from '../utils/pagination';
import { transformResponse } from '../utils/caseConverter';
import rateLimit from 'express-rate-limit';

// Rate limiter for assign driver (prevent abuse)
const assignDriverLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10, // 10 assigns per minute per IP
  message: { error: 'Too many assign requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});


const router = express.Router();

// Ride interface matching SQLite schema
interface Ride {
  id: string;
  patient_id: string;
  patient_name: string;
  patient_phone?: string;
  driver_id?: string | null;
  driver_name?: string | null;
  vehicle_id?: string | null;

  pickup_location: string;
  pickup_lat?: string;
  pickup_lng?: string;
  destination: string;
  destination_lat?: string;
  destination_lng?: string;

  appointment_time: string;
  pickup_time?: string;
  dropoff_time?: string;

  trip_type?: string;
  special_needs?: string; // JSON string
  notes?: string;
  distance_km?: number;

  status: string;
  cancellation_reason?: string;

  created_by?: string;
  created_at?: string;
  updated_at?: string;
}

// Helper to generate ride ID
const generateRideId = (): string => {
  const rides = sqliteDB.all<{ id: string }>('SELECT id FROM rides ORDER BY id DESC LIMIT 1');

  // If no rides exist, start with RIDE-001
  if (rides.length === 0) return 'RIDE-001';

  const lastId = rides[0].id;

  // Handle invalid format or missing ID
  if (!lastId || !lastId.includes('-')) {
    console.warn('Invalid ride ID format, starting from RIDE-001');
    return 'RIDE-001';
  }

  const parts = lastId.split('-');
  const numStr = parts[1];
  const num = parseInt(numStr, 10);

  // Handle NaN case
  if (isNaN(num)) {
    console.warn(`Invalid ride number in ID: ${lastId}, starting from RIDE-001`);
    return 'RIDE-001';
  }

  return `RIDE-${String(num + 1).padStart(3, '0')}`;
};

// Apply authentication to all routes
router.use(authenticateToken);

// GET /api/rides - fetch rides (filtered by created_by for community users)
router.get('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    // Parse pagination parameters
    const { page, limit, offset } = parsePaginationParams(req.query);

    // Build WHERE clause
    let whereClause = '';
    const params: any[] = [];

    // Filter by created_by if user is community role
    if (req.user?.role === 'community' && req.user?.id) {
      whereClause = 'WHERE r.created_by = ?';
      params.push(req.user.id);
    } else if (
      req.user?.role !== 'admin' &&
      req.user?.role !== 'DEVELOPER' &&
      req.user?.role !== 'radio_center' &&
      req.user?.role !== 'radio' &&
      req.user?.role !== 'OFFICER' &&
      req.user?.role !== 'EXECUTIVE' &&
      req.user?.role !== 'driver'
    ) {
      // If not an authorized role, deny access to full list
      return res.status(403).json({ error: 'Access denied' });
    }

    // Get total count
    const countSql = `
      SELECT COUNT(*) as count 
      FROM rides r
      LEFT JOIN patients p ON r.patient_id = p.id
      ${whereClause}
    `;
    const countResult = sqliteDB.get<{ count: number }>(countSql, params);
    const total = countResult?.count || 0;

    // Get paginated data
    const dataSql = `
      SELECT r.*, 
             p.latitude, 
             p.longitude,
             p.contact_phone as patient_contact_phone,
             p.current_village
      FROM rides r
      LEFT JOIN patients p ON r.patient_id = p.id
      ${whereClause}
      ORDER BY r.appointment_time DESC
      LIMIT ? OFFSET ?
    `;
    const rides = sqliteDB.all<any>(dataSql, [...params, limit, offset]);

    // Transform to camelCase and parse JSON fields
    const transformedRides = rides.map(r => {
      const camelCaseRide = transformResponse(r);

      // Parse special_needs JSON field
      if (typeof camelCaseRide.specialNeeds === 'string') {
        try {
          camelCaseRide.specialNeeds = JSON.parse(camelCaseRide.specialNeeds);
        } catch { camelCaseRide.specialNeeds = []; }
      }

      return camelCaseRide;
    });

    // Return paginated response
    res.json(createPaginatedResponse(transformedRides, page, limit, total));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/rides/:id - fetch single ride
router.get('/:id', authenticateToken, async (req: AuthRequest, res) => {
  const { id } = req.params;
  try {
    const ride = sqliteDB.get<any>('SELECT * FROM rides WHERE id = ?', [id]);
    if (!ride) {
      return res.status(404).json({ error: 'Ride not found' });
    }

    // Check ownership for community users
    if (req.user?.role === 'community' && ride.created_by && ride.created_by !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Transform to camelCase and parse JSON
    const camelCaseRide = transformResponse(ride);
    if (typeof camelCaseRide.specialNeeds === 'string') {
      try {
        camelCaseRide.specialNeeds = JSON.parse(camelCaseRide.specialNeeds);
      } catch { camelCaseRide.specialNeeds = []; }
    }

    res.json(camelCaseRide);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/rides - create new ride
router.post('/', checkDuplicateRide, async (req: AuthRequest, res) => {
  try {
    const {
      patient_id, patient_name, appointment_time, pickup_location,
      destination, special_needs, caregiver_count, contact_phone, trip_type,
      village, landmark, caregiver_phone
    } = req.body;

    const newId = generateRideId();

    const newRide = {
      id: newId,
      patient_id: patient_id || '',
      patient_name: patient_name || 'Unknown Patient',
      patient_phone: contact_phone || null,
      driver_id: null,
      driver_name: null,
      vehicle_id: null,

      pickup_location: pickup_location || '',
      pickup_lat: req.body.pickup_lat || null,
      pickup_lng: req.body.pickup_lng || null,
      destination: destination || '',
      destination_lat: req.body.destination_lat || null,
      destination_lng: req.body.destination_lng || null,

      appointment_time: appointment_time || new Date().toISOString(),
      pickup_time: null,
      dropoff_time: null,

      trip_type: trip_type || 'นัดหมอตามปกติ',
      special_needs: typeof special_needs === 'string' ? special_needs : JSON.stringify(special_needs || []),
      notes: req.body.notes || null,
      distance_km: req.body.distance || null,

      status: req.body.status || 'PENDING',
      cancellation_reason: null,

      village: village || null,
      landmark: landmark || null,
      caregiver_phone: caregiver_phone || contact_phone || null,

      created_by: req.user?.id || null
    };

    console.log('Creating ride with data:', newRide);
    sqliteDB.insert('rides', newRide);

    // Audit Log
    if (req.user) {
      auditService.log(
        req.user.email || 'unknown',
        req.user.role || 'unknown',
        'CREATE_RIDE',
        newId,
        { patient_id, patient_name, trip_type, destination }
      );

      // Ride Event Timeline
      logRideEvent(
        newId,
        'CREATED',
        { id: req.user.id || '', email: req.user.email, fullName: req.user.email, role: req.user.role },
        { patient_name, destination, trip_type },
        `สร้างคำขอเดินทางสำหรับ ${patient_name || 'ผู้ป่วย'}`
      );
    }

    const created = sqliteDB.get<any>('SELECT * FROM rides WHERE id = ?', [newId]);

    // Transform to camelCase
    const camelCaseRide = transformResponse(created);
    if (typeof camelCaseRide.specialNeeds === 'string') {
      try {
        camelCaseRide.specialNeeds = JSON.parse(camelCaseRide.specialNeeds);
      } catch { camelCaseRide.specialNeeds = []; }
    }

    res.status(201).json(camelCaseRide);
  } catch (err: any) {
    console.error('Error creating ride:', err);
    console.error('Request body:', req.body);
    res.status(500).json({ error: err.message, details: err.stack });
  }
});

// PUT /api/rides/:id - update ride status and optionally assign driver
router.put('/:id', assignDriverLimiter, async (req: AuthRequest, res) => {
  const { id } = req.params;
  const { status, driver_id, driver_name, ...otherUpdates } = req.body;
  try {
    const existing = sqliteDB.get<Ride>('SELECT * FROM rides WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ error: 'Ride not found' });
    }

    // Community users can only update their own rides
    if (req.user?.role === 'community' && existing.created_by && existing.created_by !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Drivers can only update rides assigned to them
    if (req.user?.role === 'driver' && existing.driver_id && existing.driver_id !== req.user.driver_id) {
      return res.status(403).json({ error: 'Access denied: This ride is not assigned to you' });
    }

    // Only OFFICER, RADIO_CENTER, ADMIN can assign drivers
    if (driver_id && driver_id !== existing.driver_id) {
      const allowedRoles = ['OFFICER', 'radio_center', 'RADIO_CENTER', 'admin', 'DEVELOPER'];
      if (!req.user?.role || !allowedRoles.includes(req.user.role)) {
        return res.status(403).json({ error: 'Access denied: Only officers can assign drivers' });
      }

      // Check driver exists (outside transaction for early validation)
      const driverRecord = sqliteDB.get<any>('SELECT * FROM drivers WHERE id = ?', [driver_id]);
      if (!driverRecord) {
        return res.status(404).json({ error: 'Driver not found' });
      }
    }

    // Check for driver conflict if assigning a new driver
    // Use transaction to prevent race conditions
    if (driver_id && driver_id !== existing.driver_id) {
      try {
        sqliteDB.transaction(() => {
          // Check driver availability first
          const driver = sqliteDB.db.prepare('SELECT status FROM drivers WHERE id = ?').get(driver_id) as any;
          if (driver && driver.status !== 'AVAILABLE') {
            throw new Error(`คนขับไม่ว่าง (สถานะ: ${driver.status})`);
          }

          // Check for conflicts within transaction
          const conflict = sqliteDB.db.prepare(`
            SELECT * FROM rides 
            WHERE driver_id = ? 
              AND id != ? 
              AND status NOT IN ('COMPLETED', 'CANCELLED', 'REJECTED')
              AND ABS(CAST((julianday(appointment_time) - julianday(?)) * 24 * 60 * 60 AS INTEGER)) < 3600
          `).get(driver_id, id, existing.appointment_time);

          if (conflict) {
            throw new Error(`คนขับติดงานอื่นในช่วงเวลาใกล้เคียงกัน (Ride ID: ${(conflict as any).id})`);
          }

          // Update driver status to ON_DUTY (prevents concurrent assignments)
          sqliteDB.db.prepare('UPDATE drivers SET status = ? WHERE id = ?').run('ON_DUTY', driver_id);

          // Update ride with driver assignment
          const updateData: any = {
            ...otherUpdates,
            status,
            driver_id: driver_id || null,
          };

          if (driver_name) {
            updateData.driver_name = driver_name;
          }

          sqliteDB.update('rides', id, updateData);
        });
      } catch (error: any) {
        return res.status(409).json({ error: error.message });
      }
    } else {
      // No driver assignment, just update normally
      const updateData: any = {
        ...otherUpdates,
        status,
        driver_id: driver_id || null,
      };

      if (driver_name) {
        updateData.driver_name = driver_name;
      }

      sqliteDB.update('rides', id, updateData);
    }

    // Audit Log
    if (req.user) {
      const isAssignment = driver_id && driver_id !== existing.driver_id;
      auditService.log(
        req.user.email || 'unknown',
        req.user.role || 'unknown',
        isAssignment ? 'ASSIGN_DRIVER' : 'UPDATE_RIDE',
        id,
        isAssignment
          ? { driver_id, driver_name, previous_driver: existing.driver_id, status }
          : { status, ...otherUpdates }
      );

      // Ride Event Timeline
      if (isAssignment) {
        logRideEvent(
          id,
          'ASSIGNED',
          { id: req.user.id || '', email: req.user.email, fullName: req.user.email, role: req.user.role },
          { driver_id, driver_name },
          `จ่ายงานให้ ${driver_name || driver_id}`
        );
      }

      // Log status change events
      if (status && status !== existing.status) {
        const eventTypeMap: Record<string, any> = {
          'EN_ROUTE_TO_PICKUP': 'EN_ROUTE',
          'ARRIVED_AT_PICKUP': 'ARRIVED',
          'IN_PROGRESS': 'IN_PROGRESS',
          'COMPLETED': 'COMPLETED',
          'CANCELLED': 'CANCELLED'
        };

        const eventType = eventTypeMap[status];
        if (eventType) {
          const descriptions: Record<string, string> = {
            'EN_ROUTE': 'คนขับกำลังเดินทางไปรับผู้ป่วย',
            'ARRIVED': 'คนขับถึงจุดรับผู้ป่วยแล้ว',
            'IN_PROGRESS': 'กำลังเดินทางไปจุดหมาย',
            'COMPLETED': 'เสร็จสิ้นการเดินทาง',
            'CANCELLED': 'ยกเลิกการเดินทาง'
          };

          logRideEvent(
            id,
            eventType,
            { id: req.user.id || '', email: req.user.email, fullName: req.user.email, role: req.user.role },
            { previous_status: existing.status, new_status: status },
            descriptions[eventType]
          );

          // Update driver performance metrics if COMPLETED
          if (status === 'COMPLETED' && existing.driver_id) {
            const driver = sqliteDB.get<any>('SELECT * FROM drivers WHERE id = ?', [existing.driver_id]);
            if (driver) {
              sqliteDB.update('drivers', driver.id, {
                total_trips: (driver.total_trips || 0) + 1,
                trips_this_month: (driver.trips_this_month || 0) + 1,
                status: 'AVAILABLE' // Set back to available after completion
              });
            }
          }
        }
      }
    }

    const updated = sqliteDB.get<any>('SELECT * FROM rides WHERE id = ?', [id]);

    // Transform to camelCase
    const camelCaseRide = transformResponse(updated);
    if (typeof camelCaseRide.specialNeeds === 'string') {
      try {
        camelCaseRide.specialNeeds = JSON.parse(camelCaseRide.specialNeeds);
      } catch { camelCaseRide.specialNeeds = []; }
    }

    res.json(camelCaseRide);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/rides/:id - delete ride
router.delete('/:id', async (req: AuthRequest, res) => {
  const { id } = req.params;
  try {
    const existing = sqliteDB.get<Ride>('SELECT * FROM rides WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ error: 'Ride not found' });
    }

    // Community users can only delete their own rides
    if (req.user?.role === 'community' && existing.created_by && existing.created_by !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Audit Log before delete
    if (req.user) {
      const action = existing.status === 'PENDING' ? 'CANCEL_RIDE' : 'DELETE_RIDE';
      auditService.log(
        req.user.email || 'unknown',
        req.user.role || 'unknown',
        action,
        id,
        { patient_name: existing.patient_name, status: existing.status }
      );
    }

    sqliteDB.delete('rides', id);
    res.status(204).send();
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;

