import express from 'express';
import { authenticateToken, AuthRequest, requireRole } from '../middleware/auth';
import { sqliteDB } from '../db/sqliteDB';

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
const generateDriverId = (): string => {
  const drivers = sqliteDB.all<{ id: string }>('SELECT id FROM drivers ORDER BY id DESC LIMIT 1');
  if (drivers.length === 0) return 'DRV-001';
  const lastId = drivers[0].id;
  const num = parseInt(lastId.split('-')[1]) + 1;
  return `DRV-${String(num).padStart(3, '0')}`;
};

// Apply authentication to all routes
router.use(authenticateToken);

// GET /api/drivers - fetch all drivers
router.get('/', requireRole(['admin', 'DEVELOPER', 'OFFICER', 'radio', 'radio_center', 'EXECUTIVE']), async (_req, res) => {
  try {
    const drivers = sqliteDB.all<Driver>('SELECT * FROM drivers ORDER BY full_name');
    res.json(drivers);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/drivers/available - fetch available drivers
router.get('/available', requireRole(['admin', 'DEVELOPER', 'OFFICER', 'radio', 'radio_center', 'EXECUTIVE']), async (_req, res) => {
  try {
    const drivers = sqliteDB.all<any>(`
      SELECT d.*, 
             dl.latitude, 
             dl.longitude, 
             dl.timestamp as last_updated
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

    let driver = sqliteDB.get<Driver>('SELECT * FROM drivers WHERE id = ?', [driverId]);
    if (!driver && userId) {
      driver = sqliteDB.get<Driver>('SELECT * FROM drivers WHERE user_id = ?', [userId]);
    }

    if (!driver) {
      return res.status(403).json({ error: 'Driver profile not found for this user' });
    }

    const rides = sqliteDB.all<any>('SELECT * FROM rides WHERE driver_id = ? ORDER BY appointment_time DESC', [driver.id]);
    res.json(rides);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/drivers/my-profile - get current driver's profile
router.get('/my-profile', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id;
    const driverId = req.user?.driver_id;

    let driver = sqliteDB.get<any>(`
      SELECT d.*, u.full_name as user_full_name, u.email, 
             v.license_plate, v.brand as vehicle_brand, v.model as vehicle_model, 
             v.color as vehicle_color, v.year as vehicle_year, vt.name as vehicle_type
      FROM drivers d
      JOIN users u ON d.user_id = u.id
      LEFT JOIN vehicles v ON d.current_vehicle_id = v.id
      LEFT JOIN vehicle_types vt ON v.vehicle_type_id = vt.id
      WHERE d.id = ?
    `, [driverId]);

    if (!driver && userId) {
      driver = sqliteDB.get<any>(`
        SELECT d.*, u.full_name as user_full_name, u.email, 
               v.license_plate, v.brand as vehicle_brand, v.model as vehicle_model, 
               v.color as vehicle_color, v.year as vehicle_year, vt.name as vehicle_type
        FROM drivers d
        JOIN users u ON d.user_id = u.id
        LEFT JOIN vehicles v ON d.current_vehicle_id = v.id
        LEFT JOIN vehicle_types vt ON v.vehicle_type_id = vt.id
        WHERE d.user_id = ?
      `, [userId]);
    }

    if (!driver) {
      return res.status(404).json({ error: 'Driver profile not found' });
    }

    // Split name for frontend
    const nameParts = (driver.user_full_name || '').split(' ');
    driver.first_name = nameParts[0] || '';
    driver.last_name = nameParts.slice(1).join(' ') || '';

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

    let driver = sqliteDB.get<any>(`
      SELECT d.*, u.full_name as user_full_name, u.id as user_actual_id
      FROM drivers d
      JOIN users u ON d.user_id = u.id
      WHERE d.id = ?
    `, [driverId]);

    if (!driver && userId) {
      driver = sqliteDB.get<any>(`
        SELECT d.*, u.full_name as user_full_name, u.id as user_actual_id
        FROM drivers d
        JOIN users u ON d.user_id = u.id
        WHERE d.user_id = ?
      `, [userId]);
    }

    if (!driver) {
      return res.status(404).json({ error: 'Driver profile not found' });
    }

    const { first_name, last_name, phone, license_number, license_expiry, address, status } = req.body;

    // Update Users table if name changed
    if (first_name !== undefined || last_name !== undefined) {
      const nameParts = (driver.user_full_name || '').split(' ');
      const currentFirstName = nameParts[0] || '';
      const currentLastName = nameParts.slice(1).join(' ') || '';

      const newFirstName = first_name !== undefined ? first_name : currentFirstName;
      const newLastName = last_name !== undefined ? last_name : currentLastName;
      const newFullName = `${newFirstName} ${newLastName}`.trim();

      sqliteDB.update('users', driver.user_actual_id, { full_name: newFullName });

      // Also update full_name in drivers table for consistency
      sqliteDB.update('drivers', driver.id, { full_name: newFullName });
    }

    const updateData: any = {};
    if (phone !== undefined) updateData.phone = phone;
    if (license_number !== undefined) updateData.license_number = license_number;
    if (license_expiry !== undefined) updateData.license_expiry = license_expiry;
    if (address !== undefined) updateData.address = address;
    if (status !== undefined) updateData.status = status;

    sqliteDB.update('drivers', driver.id, updateData);

    // Return updated profile with joins
    const updated = sqliteDB.get<any>(`
      SELECT d.*, u.full_name as user_full_name, u.email, 
             v.license_plate, v.brand as vehicle_brand, v.model as vehicle_model, 
             v.color as vehicle_color, v.year as vehicle_year, vt.name as vehicle_type
      FROM drivers d
      JOIN users u ON d.user_id = u.id
      LEFT JOIN vehicles v ON d.current_vehicle_id = v.id
      LEFT JOIN vehicle_types vt ON v.vehicle_type_id = vt.id
      WHERE d.id = ?
    `, [driver.id]);

    if (updated) {
      const parts = (updated.user_full_name || '').split(' ');
      updated.first_name = parts[0] || '';
      updated.last_name = parts.slice(1).join(' ') || '';
    }

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

    let driver = sqliteDB.get<Driver>('SELECT * FROM drivers WHERE id = ?', [driverId]);
    if (!driver && userId) {
      driver = sqliteDB.get<Driver>('SELECT * FROM drivers WHERE user_id = ?', [userId]);
    }

    if (!driver) {
      return res.status(403).json({ error: 'Driver profile not found' });
    }

    const rides = sqliteDB.all<any>(`
      SELECT * FROM rides 
      WHERE driver_id = ? 
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
    const driver = sqliteDB.get<Driver>('SELECT * FROM drivers WHERE id = ?', [id]);
    if (!driver) {
      return res.status(404).json({ error: 'Driver not found' });
    }
    res.json(driver);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/drivers - create new driver
router.post('/', requireRole(['admin', 'DEVELOPER', 'OFFICER', 'radio', 'radio_center', 'EXECUTIVE']), async (req, res) => {
  try {
    const newId = generateDriverId();
    const newDriver = {
      id: newId,
      user_id: req.body.user_id || null,
      full_name: req.body.full_name,
      phone: req.body.phone || null,
      license_number: req.body.license_number || null,
      license_expiry: req.body.license_expiry || null,
      status: req.body.status || 'AVAILABLE',
      current_vehicle_id: req.body.current_vehicle_id || null,
      profile_image_url: req.body.profile_image_url || null
    };

    sqliteDB.insert('drivers', newDriver);
    const created = sqliteDB.get<Driver>('SELECT * FROM drivers WHERE id = ?', [newId]);
    res.status(201).json(created);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/drivers/:id - update driver
router.put('/:id', requireRole(['admin', 'DEVELOPER', 'OFFICER', 'radio', 'radio_center']), async (req, res) => {
  const { id } = req.params;
  try {
    const updateData: any = {};
    if (req.body.full_name) updateData.full_name = req.body.full_name;
    if (req.body.phone) updateData.phone = req.body.phone;
    if (req.body.status) updateData.status = req.body.status;
    if (req.body.license_number) updateData.license_number = req.body.license_number;
    if (req.body.current_vehicle_id !== undefined) updateData.current_vehicle_id = req.body.current_vehicle_id;

    sqliteDB.update('drivers', id, updateData);
    const updated = sqliteDB.get<Driver>('SELECT * FROM drivers WHERE id = ?', [id]);
    if (!updated) {
      return res.status(404).json({ error: 'Driver not found' });
    }
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/drivers/:id - delete driver
router.delete('/:id', requireRole(['admin', 'DEVELOPER', 'OFFICER']), async (req, res) => {
  const { id } = req.params;
  try {
    const result = sqliteDB.delete('drivers', id);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Driver not found' });
    }
    res.status(204).send();
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
