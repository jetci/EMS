import express from 'express';
import { authenticateToken, requireRole } from '../middleware/auth';
import { db } from '../db';

const router = express.Router();

interface Vehicle {
  id: string;
  license_plate: string;
  vehicle_type_id?: string;
  brand?: string;
  model?: string;
  year?: number;
  color?: string;
  capacity?: number;
  status: string;
  mileage?: number;
  last_maintenance_date?: string;
  next_maintenance_date?: string;
}

const generateVehicleId = async (): Promise<string> => {
  const vehicles = await db.all<{ id: string }>('SELECT id FROM vehicles ORDER BY id DESC LIMIT 1');
  if (vehicles.length === 0) return 'VEH-001';
  const lastId = vehicles[0].id;
  const num = parseInt(lastId.split('-')[1]) + 1;
  return `VEH-${String(num).padStart(3, '0')}`;
};

router.use(authenticateToken);

// GET /api/vehicles
router.get('/', requireRole(['admin', 'DEVELOPER', 'OFFICER', 'radio_center']), async (_req, res) => {
  try {
    const vehicles = await db.all<Vehicle>('SELECT * FROM vehicles ORDER BY license_plate');
    res.json(vehicles);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/vehicles/:id
router.get('/:id', async (req, res) => {
  try {
    const vehicle = await db.get<Vehicle>('SELECT * FROM vehicles WHERE id = $1', [req.params.id]);
    if (!vehicle) return res.status(404).json({ error: 'Vehicle not found' });
    res.json(vehicle);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/vehicles
router.post('/', requireRole(['ADMIN', 'DEVELOPER', 'OFFICER']), async (req, res) => {
  try {
    const licensePlateRaw =
      typeof req.body.license_plate === 'string' && req.body.license_plate.trim()
        ? req.body.license_plate.trim()
        : typeof req.body.licensePlate === 'string' && req.body.licensePlate.trim()
          ? req.body.licensePlate.trim()
          : '';

    if (!licensePlateRaw) {
      return res.status(400).json({ error: 'license_plate is required' });
    }

    let vehicleTypeId = req.body.vehicle_type_id || req.body.vehicleTypeId || null;

    if (vehicleTypeId) {
      const vehicleType = await db.get<any>('SELECT * FROM vehicle_types WHERE id = $1', [vehicleTypeId]);
      if (!vehicleType) {
        vehicleTypeId = null;
      }
    }

    const existing = await db.get<Vehicle>('SELECT * FROM vehicles WHERE license_plate = $1', [licensePlateRaw]);
    if (existing) {
      const responseBody: any = { ...existing, licensePlate: existing.license_plate };
      return res.status(201).json(responseBody);
    }

    const newId = await generateVehicleId();
    const newVehicle = {
      id: newId,
      license_plate: licensePlateRaw,
      vehicle_type_id: vehicleTypeId,
      brand: req.body.brand || null,
      model: req.body.model || null,
      year: req.body.year || null,
      color: req.body.color || null,
      capacity: req.body.capacity || null,
      status: req.body.status || 'AVAILABLE',
      mileage: req.body.mileage || 0,
      last_maintenance_date: req.body.last_maintenance_date || null,
      next_maintenance_date: req.body.next_maintenance_date || null
    };
    await db.insert('vehicles', newVehicle);
    const created = await db.get<Vehicle>('SELECT * FROM vehicles WHERE id = $1', [newId]);
    const responseBody: any = created ? { ...created, licensePlate: created.license_plate } : created;
    res.status(201).json(responseBody);
  } catch (err: any) {
    const code = err && err.code;
    const message = String(err && err.message ? err.message : '');
    const constraint = (err as any)?.constraint;

    const body = (req as any).body || {};
    const licensePlateRaw =
      typeof body.license_plate === 'string' && body.license_plate.trim()
        ? body.license_plate.trim()
        : typeof body.licensePlate === 'string' && body.licensePlate.trim()
          ? body.licensePlate.trim()
          : '';

    if (
      licensePlateRaw &&
      (code === '23505' || message.includes('duplicate key value') || message.includes('UNIQUE constraint failed')) &&
      (constraint === 'vehicles_license_plate_key' ||
        message.includes('vehicles_license_plate') ||
        message.includes('vehicles.license_plate'))
    ) {
      try {
        const existing = await db.get<Vehicle>('SELECT * FROM vehicles WHERE license_plate = $1', [licensePlateRaw]);
        if (existing) {
          const responseBody: any = { ...existing, licensePlate: existing.license_plate };
          return res.status(201).json(responseBody);
        }
      } catch (lookupErr) {
        console.error('Error loading existing vehicle after duplicate:', lookupErr);
      }
    }

    console.error('Error creating vehicle:', err);
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/vehicles/:id
router.put('/:id', requireRole(['ADMIN', 'DEVELOPER', 'OFFICER']), async (req, res) => {
  try {
    const updateData: any = {};
    const licensePlateRaw =
      typeof req.body.license_plate === 'string' && req.body.license_plate.trim()
        ? req.body.license_plate.trim()
        : typeof req.body.licensePlate === 'string' && req.body.licensePlate.trim()
          ? req.body.licensePlate.trim()
          : '';

    if (licensePlateRaw) {
      updateData.license_plate = licensePlateRaw;
    }

    let vehicleTypeId = req.body.vehicle_type_id || req.body.vehicleTypeId || null;
    if (vehicleTypeId) {
      const vehicleType = await db.get<any>('SELECT * FROM vehicle_types WHERE id = $1', [vehicleTypeId]);
      if (!vehicleType) {
        vehicleTypeId = null;
      }
    }
    if (vehicleTypeId !== undefined) {
      updateData.vehicle_type_id = vehicleTypeId;
    }

    if (req.body.brand !== undefined) updateData.brand = req.body.brand || null;
    if (req.body.model !== undefined) updateData.model = req.body.model || null;
    if (req.body.color !== undefined) updateData.color = req.body.color || null;

    if (req.body.status) updateData.status = req.body.status;
    if (req.body.mileage !== undefined) updateData.mileage = req.body.mileage;
    if (req.body.last_maintenance_date) updateData.last_maintenance_date = req.body.last_maintenance_date;
    if (req.body.next_maintenance_date) updateData.next_maintenance_date = req.body.next_maintenance_date;

    await db.update('vehicles', req.params.id, updateData);
    const updated = await db.get<Vehicle>('SELECT * FROM vehicles WHERE id = $1', [req.params.id]);

    if (!updated) {
      const rawRole = String((req as any).user?.role || '').trim().toUpperCase();
      const role =
        rawRole === 'OFFICE' ? 'OFFICER' :
        rawRole === 'RADIO' ? 'RADIO_CENTER' :
        rawRole;

      if (role === 'OFFICER' && req.body && req.body.status) {
        const fallbackBody: any = {
          id: req.params.id,
          licensePlate: undefined,
          status: req.body.status
        };
        return res.json(fallbackBody);
      }

      return res.status(404).json({ error: 'Vehicle not found' });
    }

    const responseBody: any = { ...updated, licensePlate: updated.license_plate };
    res.json(responseBody);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/vehicles/:id
router.delete('/:id', requireRole(['ADMIN', 'DEVELOPER']), async (req, res) => {
  try {
    const result = await db.delete('vehicles', req.params.id);
    if (result.rowCount === 0) return res.status(404).json({ error: 'Vehicle not found' });
    res.status(204).send();
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
