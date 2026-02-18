import express from 'express';
import { db } from '../db';
import { optionalAuth, AuthRequest, authenticateToken, requireRole } from '../middleware/auth';
import { auditService } from '../services/auditService';
import { logRideEvent, RideEvent } from './ride-events';
import { checkDuplicateRide } from '../middleware/idempotency';
import { parsePaginationParams, createPaginatedResponse } from '../utils/pagination';
import { transformResponse } from '../utils/caseConverter';
import { normalizeRole } from '../utils/roleNormalizer';
import { notifyOperationalRoles } from '../utils/socketNotifier';
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
const generateRideId = async (): Promise<string> => {
  const rides = await db.all<{ id: string }>('SELECT id FROM rides ORDER BY id DESC LIMIT 1');

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

    // ✅ FIX BUG-004: Use centralized role normalizer
    const role = normalizeRole(req.user?.role);

    // Build WHERE clause
    let whereClause = '';
    const params: any[] = [];

    // Filter by created_by if user is community role
    if (role === 'COMMUNITY' && req.user?.id) {
      whereClause = 'WHERE r.created_by = $1';
      params.push(req.user.id);
    } else if (
      role !== 'ADMIN' &&
      role !== 'DEVELOPER' &&
      role !== 'RADIO_CENTER' &&
      role !== 'OFFICER' &&
      role !== 'EXECUTIVE' &&
      role !== 'DRIVER'
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
    const countResult = await db.get<{ count: number }>(countSql, params);
    const total = countResult?.count || 0;

    // Get paginated data
    // Prepare params for limit/offset
    // If whereClause used $1, next params are $2, $3
    const startIdx = params.length + 1;
    const limitParam = `$${startIdx}`;
    const offsetParam = `$${startIdx + 1}`;

    const dataSql = `
      SELECT
        r.*,
        p.latitude,
        p.longitude,
        p.contact_phone as patient_contact_phone,
        p.current_village,
        COALESCE(r.village, p.current_village) as village,
        COALESCE(r.landmark, p.landmark) as landmark
      FROM rides r
      LEFT JOIN patients p ON r.patient_id = p.id
      ${whereClause}
      ORDER BY r.appointment_time DESC
      LIMIT ${limitParam} OFFSET ${offsetParam}
    `;
    const rides = await db.all<any>(dataSql, [...params, limit, offset]);

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
    const ride = await db.get<any>('SELECT * FROM rides WHERE id = $1', [id]);
    if (!ride) {
      return res.status(404).json({ error: 'Ride not found' });
    }

    // Check ownership for community users
    const rawRole = String(req.user?.role || '').trim().toUpperCase();
    const role = rawRole === 'OFFICE' ? 'OFFICER' : rawRole === 'RADIO' ? 'RADIO_CENTER' : rawRole;

    if (role === 'COMMUNITY' && ride.created_by && ride.created_by !== req.user?.id) {
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

    const newId = await generateRideId();

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
    await db.insert('rides', newRide);

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
      await logRideEvent(
        newId,
        'CREATED',
        { id: req.user.id || '', email: req.user.email, fullName: req.user.email, role: req.user.role },
        { patient_name, destination, trip_type },
        `สร้างคำขอเดินทางสำหรับ ${patient_name || 'ผู้ป่วย'}`
      );
    }

    const created = await db.get<any>('SELECT * FROM rides WHERE id = $1', [newId]);

    // ✅ FIX BUG-005: Use socket notification utility
    try {
      const io = (req as any).app?.get?.('io');
      if (io) {
        const ns = io.of('/locations');
        const message = `🆕 คำขอเดินทางใหม่: ${patient_name || 'ผู้ป่วย'} (${newId})`;
        const payload = { eventType: 'job_request', type: 'info' as 'info', message, rideId: newId };
        notifyOperationalRoles(ns, payload);
      }
    } catch { }

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
    const rawRole = String(req.user?.role || '').trim().toUpperCase();
    const role = rawRole === 'OFFICE' ? 'OFFICER' : rawRole === 'RADIO' ? 'RADIO_CENTER' : rawRole;

    const existing = await db.get<Ride>('SELECT * FROM rides WHERE id = $1', [id]);
    if (!existing) {
      return res.status(404).json({ error: 'Ride not found' });
    }

    const assignmentChanged = !!driver_id && driver_id !== existing.driver_id;
    const statusChanged = typeof status === 'string' && status.length > 0 && status !== existing.status;

    if (role === 'COMMUNITY' && existing.created_by && existing.created_by !== req.user?.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (role === 'DRIVER' && existing.driver_id && existing.driver_id !== req.user?.driver_id) {
      return res.status(403).json({ error: 'Access denied: This ride is not assigned to you' });
    }

    if (assignmentChanged) {
      const allowedRoles = new Set(['OFFICER', 'RADIO_CENTER', 'ADMIN', 'DEVELOPER']);
      if (!allowedRoles.has(role)) {
        return res.status(403).json({ error: 'Access denied: Only officers can assign drivers' });
      }

      const driverRecord = await db.get<any>('SELECT * FROM drivers WHERE id = $1', [driver_id]);
      if (!driverRecord) {
        return res.status(404).json({ error: 'Driver not found' });
      }

      try {
        await db.transaction(async (client) => {
          const driverRes = await client.query('SELECT status FROM drivers WHERE id = $1', [driver_id]);
          const driver = driverRes.rows[0];

          if (driver && driver.status !== 'AVAILABLE') {
            throw new Error(`คนขับไม่ว่าง (สถานะ: ${driver.status})`);
          }

          const conflictRes = await client.query(
            `
            SELECT * FROM rides 
            WHERE driver_id = $1 
              AND id != $2 
              AND status NOT IN ('COMPLETED', 'CANCELLED', 'REJECTED')
              AND ABS(EXTRACT(EPOCH FROM (appointment_time::timestamp - $3::timestamp))) < 3600
          `,
            [driver_id, id, existing.appointment_time]
          );

          const conflict = conflictRes.rows[0];

          if (conflict) {
            throw new Error(`คนขับติดงานอื่นในช่วงเวลาใกล้เคียงกัน (Ride ID: ${conflict.id})`);
          }

          await client.query('UPDATE drivers SET status = $1 WHERE id = $2', ['ON_DUTY', driver_id]);

          const updateData: any = {
            ...otherUpdates,
            status,
            driver_id: driver_id || null
          };

          if (driver_name) {
            updateData.driver_name = driver_name;
          }

          const keys = Object.keys(updateData);
          const values = Object.values(updateData);
          const setClause = keys.map((key, i) => `${key} = $${i + 1}`).join(', ');
          const sql = `UPDATE rides SET ${setClause}, updated_at = NOW() WHERE id = $${keys.length + 1}`;
          await client.query(sql, [...values, id]);
        });
      } catch (error: any) {
        return res.status(409).json({ error: error.message });
      }
    } else {
      const updateData: any = {
        ...otherUpdates
      };

      if (typeof status === 'string' && status.length > 0) {
        updateData.status = status;
      }

      if (typeof driver_id !== 'undefined') {
        updateData.driver_id = driver_id || null;
      }

      if (driver_name) {
        updateData.driver_name = driver_name;
      }

      await db.update('rides', id, updateData);
    }

    if (req.user) {
      const isAssignment = assignmentChanged;

      auditService.log(
        req.user.email || 'unknown',
        req.user.role || 'unknown',
        isAssignment ? 'ASSIGN_DRIVER' : 'UPDATE_RIDE',
        id,
        isAssignment
          ? { driver_id, driver_name, previous_driver: existing.driver_id, status }
          : { status, ...otherUpdates }
      );

      if (isAssignment) {
        await logRideEvent(
          id,
          'ASSIGNED',
          { id: req.user.id || '', email: req.user.email, fullName: req.user.email, role: req.user.role },
          { driver_id, driver_name },
          `จ่ายงานให้ ${driver_name || driver_id}`
        );
      }

      if (statusChanged) {
        const eventTypeMap: Record<string, RideEvent['eventType']> = {
          EN_ROUTE_TO_PICKUP: 'EN_ROUTE',
          ARRIVED_AT_PICKUP: 'ARRIVED',
          IN_PROGRESS: 'IN_PROGRESS',
          COMPLETED: 'COMPLETED',
          CANCELLED: 'CANCELLED'
        };

        const eventType = eventTypeMap[status as keyof typeof eventTypeMap];

        if (eventType) {
          const descriptions: Record<RideEvent['eventType'], string> = {
            CREATED: 'สร้างคำขอเดินทางใหม่',
            ASSIGNED: 'จ่ายงานให้คนขับ',
            EN_ROUTE: 'คนขับกำลังเดินทางไปรับผู้ป่วย',
            ARRIVED: 'คนขับถึงจุดรับผู้ป่วยแล้ว',
            IN_PROGRESS: 'กำลังเดินทางไปจุดหมาย',
            COMPLETED: 'เสร็จสิ้นการเดินทาง',
            CANCELLED: 'ยกเลิกการเดินทาง',
            NOTE: 'บันทึกเพิ่มเติม',
            LOCATION_UPDATE: 'อัปเดตตำแหน่ง'
          };

          await logRideEvent(
            id,
            eventType,
            { id: req.user.id || '', email: req.user.email, fullName: req.user.email, role: req.user.role },
            { previous_status: existing.status, new_status: status },
            descriptions[eventType]
          );

          const shouldReleaseDriver = (status === 'COMPLETED' || status === 'CANCELLED') && existing.driver_id;

          if (shouldReleaseDriver) {
            const driver = await db.get<any>('SELECT * FROM drivers WHERE id = $1', [existing.driver_id]);
            if (driver) {
              const updatePayload: any = {
                status: 'AVAILABLE'
              };

              if (status === 'COMPLETED') {
                updatePayload.total_trips = (driver.total_trips || 0) + 1;
                updatePayload.trips_this_month = (driver.trips_this_month || 0) + 1;
              }

              await db.update('drivers', driver.id, updatePayload);
            }
          }
        }
      }
    }

    const updated = await db.get<any>('SELECT * FROM rides WHERE id = $1', [id]);

    try {
      const io = (req as any).app?.get?.('io');
      if (io && (assignmentChanged || statusChanged)) {
        const ns = io.of('/locations');
        const message = assignmentChanged
          ? `✅ จ่ายงาน ${id} ให้ ${driver_name || driver_id}`
          : `🔄 อัปเดตสถานะงาน ${id}: ${existing.status} → ${status}`;
        const notificationType: 'success' | 'info' = assignmentChanged ? 'success' : 'info';
        const payload = {
          eventType: 'ride_status',
          type: notificationType,
          message,
          rideId: id,
          status
        };
        notifyOperationalRoles(ns, payload);
      }
    } catch {
    }

    const camelCaseRide = transformResponse(updated);
    if (typeof camelCaseRide.specialNeeds === 'string') {
      try {
        camelCaseRide.specialNeeds = JSON.parse(camelCaseRide.specialNeeds);
      } catch {
        camelCaseRide.specialNeeds = [];
      }
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
    const rawRole = String(req.user?.role || '').trim().toUpperCase();
    const role = rawRole === 'OFFICE' ? 'OFFICER' : rawRole === 'RADIO' ? 'RADIO_CENTER' : rawRole;

    const existing = await db.get<Ride>('SELECT * FROM rides WHERE id = $1', [id]);
    if (!existing) {
      return res.status(404).json({ error: 'Ride not found' });
    }

    // Community users can only delete their own rides
    if (role === 'COMMUNITY' && existing.created_by && existing.created_by !== req.user?.id) {
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

    await db.delete('rides', id);
    res.status(204).send();
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
