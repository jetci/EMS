import express from 'express';
import { authenticateToken, AuthRequest, requireRole } from '../middleware/auth';
import { db } from '../db';

const router = express.Router();

// Driver interface
interface Driver {
  id: string;
  user_id?: string;
  full_name: string;
  phone?: string;
  license_number?: string;
  license_expiry?: string;
  status: string;
  current_vehicle_id?: string;
  profile_image_url?: string;
  total_trips?: number;
  trips_this_month?: number;
  created_at?: string;
  updated_at?: string;
}

// Helper to generate driver ID
const generateDriverId = async (): Promise<string> => {
  const drivers = await db.all<{ id: string }>('SELECT id FROM drivers ORDER BY id DESC LIMIT 1');
  if (drivers.length === 0) return 'DRV-001';
  const lastId = drivers[0].id;
  const num = parseInt(lastId.split('-')[1]) + 1;
  return `DRV-${String(num).padStart(3, '0')}`;
};

// Apply authentication to all routes
router.use(authenticateToken);

const normalizeStatusForDb = (status: any): string | null => {
  if (typeof status !== 'string') return null;
  const s = status.trim().toUpperCase();
  if (!s) return null;
  const allowed = new Set(['AVAILABLE', 'ON_TRIP', 'OFFLINE', 'INACTIVE', 'ON_DUTY', 'OFF_DUTY', 'UNAVAILABLE']);
  return allowed.has(s) ? s : null;
};

const getVehicleInput = (body: any) => {
  const licensePlate =
    (typeof body?.license_plate === 'string' && body.license_plate.trim()) ? body.license_plate.trim()
      : (typeof body?.licensePlate === 'string' && body.licensePlate.trim()) ? body.licensePlate.trim()
        : null;

  const brand =
    (typeof body?.brand === 'string' && body.brand.trim()) ? body.brand.trim()
      : (typeof body?.vehicleBrand === 'string' && body.vehicleBrand.trim()) ? body.vehicleBrand.trim()
        : null;

  const model =
    (typeof body?.model === 'string' && body.model.trim()) ? body.model.trim()
      : (typeof body?.vehicleModel === 'string' && body.vehicleModel.trim()) ? body.vehicleModel.trim()
        : null;

  const color =
    (typeof body?.color === 'string' && body.color.trim()) ? body.color.trim()
      : (typeof body?.vehicleColor === 'string' && body.vehicleColor.trim()) ? body.vehicleColor.trim()
        : null;

  return { licensePlate, brand, model, color };
};

const generateVehicleId = async (): Promise<string> => {
  const vehicles = await db.all<{ id: string }>('SELECT id FROM vehicles ORDER BY id DESC LIMIT 1');
  if (vehicles.length === 0) return 'VEH-001';
  const lastId = vehicles[0].id;
  const num = parseInt(lastId.split('-')[1]) + 1;
  return `VEH-${String(num).padStart(3, '0')}`;
};

// GET /api/drivers - fetch all drivers
router.get('/', requireRole(['admin', 'DEVELOPER', 'OFFICER', 'radio_center', 'EXECUTIVE', 'driver']), async (_req, res) => {
  try {
    const drivers = await db.all<any>(`
      SELECT d.*,
             v.license_plate,
             v.brand,
             v.model,
             v.color
      FROM drivers d
      LEFT JOIN vehicles v ON v.id = d.current_vehicle_id
      ORDER BY d.full_name
    `);
    res.json(drivers);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/drivers/available - fetch available drivers
router.get('/available', requireRole(['admin', 'DEVELOPER', 'OFFICER', 'radio_center', 'EXECUTIVE', 'driver']), async (_req, res) => {
  try {
    const drivers = await db.all<any>(`
      SELECT d.*, 
             dl.latitude, 
             dl.longitude, 
             dl.timestamp as last_updated_timestamp
      FROM drivers d
      LEFT JOIN (
        SELECT driver_id, latitude, longitude, timestamp,
               ROW_NUMBER() OVER (PARTITION BY driver_id ORDER BY timestamp DESC) as rn
        FROM driver_locations
      ) dl ON d.id = dl.driver_id AND dl.rn = 1
      WHERE d.status = 'AVAILABLE'
    `);
    res.json(drivers);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/drivers/my-rides - fetch rides for logged-in driver
router.get('/my-rides', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id;
    const driverId = req.user?.driver_id;

    let driver = await db.get<Driver>('SELECT * FROM drivers WHERE id = $1', [driverId]);
    if (!driver && userId) {
      driver = await db.get<Driver>('SELECT * FROM drivers WHERE user_id = $1', [userId]);
    }

    if (!driver) {
      return res.status(403).json({ error: 'Driver profile not found for this user' });
    }

    const rides = await db.all<any>('SELECT * FROM rides WHERE driver_id = $1 ORDER BY appointment_time DESC', [driver.id]);
    res.json(rides);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/drivers/my-profile - get current driver's profile (with vehicle info)
router.get('/my-profile', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id;
    const driverId = req.user?.driver_id;

    let driver: any | null = null;

    if (driverId) {
      driver = await db.get<any>(
        `
        SELECT d.*,
               v.license_plate,
               v.brand,
               v.model,
               v.color
        FROM drivers d
        LEFT JOIN vehicles v ON v.id = d.current_vehicle_id
        WHERE d.id = $1
        `,
        [driverId]
      );
    }

    if (!driver && userId) {
      driver = await db.get<any>(
        `
        SELECT d.*,
               v.license_plate,
               v.brand,
               v.model,
               v.color
        FROM drivers d
        LEFT JOIN vehicles v ON v.id = d.current_vehicle_id
        WHERE d.user_id = $1
        `,
        [userId]
      );
    }

    if (!driver) {
      return res.status(404).json({ error: 'Driver profile not found' });
    }

    res.json(driver);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/drivers/my-profile - update current driver's profile
router.put('/my-profile', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id;
    const driverId = req.user?.driver_id;

    let driver = await db.get<Driver>('SELECT * FROM drivers WHERE id = $1', [driverId]);
    if (!driver && userId) {
      driver = await db.get<Driver>('SELECT * FROM drivers WHERE user_id = $1', [userId]);
    }

    if (!driver) {
      return res.status(404).json({ error: 'Driver profile not found' });
    }

    const { full_name, phone, license_number, status } = req.body;
    const updateData: any = {};
    if (full_name) updateData.full_name = full_name;
    if (phone) updateData.phone = phone;
    if (license_number) updateData.license_number = license_number;
    if (status) updateData.status = status;

    await db.update('drivers', driver.id, updateData);
    const updated = await db.get<Driver>('SELECT * FROM drivers WHERE id = $1', [driver.id]);
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/drivers/my-history - fetch completed/cancelled rides
router.get('/my-history', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id;
    const driverId = req.user?.driver_id;

    let driver = await db.get<Driver>('SELECT * FROM drivers WHERE id = $1', [driverId]);
    if (!driver && userId) {
      driver = await db.get<Driver>('SELECT * FROM drivers WHERE user_id = $1', [userId]);
    }

    if (!driver) {
      return res.status(403).json({ error: 'Driver profile not found' });
    }

    const rides = await db.all<any>(`
      SELECT * FROM rides 
      WHERE driver_id = $1 
        AND status IN ('COMPLETED', 'CANCELLED')
      ORDER BY appointment_time DESC
    `, [driver.id]);

    res.json(rides);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/drivers/:id - fetch driver by ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const driver = await db.get<Driver>('SELECT * FROM drivers WHERE id = $1', [id]);
    if (!driver) {
      return res.status(404).json({ error: 'Driver not found' });
    }
    res.json(driver);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/drivers - create new driver
router.post('/', requireRole(['admin', 'DEVELOPER', 'OFFICER']), async (req: AuthRequest, res) => {
  try {
    const status = normalizeStatusForDb(req.body.status) || 'AVAILABLE';
    const vehicle = getVehicleInput(req.body);
    let vehicleId: string | null = null;
    if (vehicle.licensePlate) {
      const existing = await db.get<any>('SELECT * FROM vehicles WHERE license_plate = $1', [vehicle.licensePlate]);
      if (existing?.id) {
        vehicleId = existing.id;
        const updateVehicle: any = {};
        if (vehicle.brand) updateVehicle.brand = vehicle.brand;
        if (vehicle.model) updateVehicle.model = vehicle.model;
        if (vehicle.color) updateVehicle.color = vehicle.color;
        if (Object.keys(updateVehicle).length > 0) {
          await db.update('vehicles', existing.id, updateVehicle);
        }
      } else {
        vehicleId = await generateVehicleId();
        await db.insert('vehicles', {
          id: vehicleId,
          license_plate: vehicle.licensePlate,
          brand: vehicle.brand,
          model: vehicle.model,
          color: vehicle.color,
          status: 'AVAILABLE',
          mileage: 0,
        });
      }
    }

    const requestedUserId = req.body.user_id || req.body.userId || null;
    if (requestedUserId) {
      const user = await db.get<any>('SELECT * FROM users WHERE id = $1', [requestedUserId]);
      if (!user) return res.status(400).json({ error: 'User not found' });
      const userRole = String(user.role || '').toUpperCase();
      if (userRole === 'ADMIN' || userRole === 'DEVELOPER') {
        return res.status(400).json({ error: 'Invalid user role for driver' });
      }
      if (userRole !== 'DRIVER') {
        await db.update('users', requestedUserId, { role: 'driver' });
      }
    }

    const newId = await generateDriverId();
    const newDriver = {
      id: newId,
      user_id: requestedUserId,
      full_name: req.body.full_name || req.body.fullName,
      phone: req.body.phone || null,
      license_number: req.body.license_number || null,
      license_expiry: req.body.license_expiry || null,
      status,
      current_vehicle_id: vehicleId || req.body.current_vehicle_id || null,
      profile_image_url: req.body.profile_image_url || null
    };

    await db.insert('drivers', newDriver);
    const created = await db.get<Driver>('SELECT * FROM drivers WHERE id = $1', [newId]);
    res.status(201).json(created);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/drivers/:id - update driver
router.put('/:id', requireRole(['admin', 'DEVELOPER', 'OFFICER', 'radio_center']), async (req: AuthRequest, res) => {
  const { id } = req.params;
  try {
    const updateData: any = {};
    if (req.body.full_name || req.body.fullName) updateData.full_name = req.body.full_name || req.body.fullName;
    if (req.body.phone) updateData.phone = req.body.phone;
    const status = normalizeStatusForDb(req.body.status);
    if (status) updateData.status = status;
    if (req.body.license_number) updateData.license_number = req.body.license_number;
    if (req.body.current_vehicle_id !== undefined) updateData.current_vehicle_id = req.body.current_vehicle_id;

    const vehicle = getVehicleInput(req.body);
    if (vehicle.licensePlate) {
      const existing = await db.get<any>('SELECT * FROM vehicles WHERE license_plate = $1', [vehicle.licensePlate]);
      if (existing?.id) {
        updateData.current_vehicle_id = existing.id;
        const updateVehicle: any = {};
        if (vehicle.brand) updateVehicle.brand = vehicle.brand;
        if (vehicle.model) updateVehicle.model = vehicle.model;
        if (vehicle.color) updateVehicle.color = vehicle.color;
        if (Object.keys(updateVehicle).length > 0) {
          await db.update('vehicles', existing.id, updateVehicle);
        }
      } else {
        const normalizedRole = String(req.user?.role || '').toUpperCase();
        const canCreateVehicle =
          normalizedRole === 'DEVELOPER' ||
          normalizedRole === 'ADMIN' ||
          normalizedRole === 'OFFICER' ||
          normalizedRole === 'RADIO_CENTER';
        if (canCreateVehicle) {
          const vehicleId = await generateVehicleId();
          await db.insert('vehicles', {
            id: vehicleId,
            license_plate: vehicle.licensePlate,
            brand: vehicle.brand,
            model: vehicle.model,
            color: vehicle.color,
            status: 'AVAILABLE',
            mileage: 0,
          });
          updateData.current_vehicle_id = vehicleId;
        }
      }
    }

    await db.update('drivers', id, updateData);
    const updated = await db.get<Driver>('SELECT * FROM drivers WHERE id = $1', [id]);
    if (!updated) {
      return res.status(404).json({ error: 'Driver not found' });
    }
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/drivers/:id - delete driver
router.delete('/:id', requireRole(['admin', 'DEVELOPER']), async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.delete('drivers', id);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Driver not found' });
    }
    res.status(204).send();
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
