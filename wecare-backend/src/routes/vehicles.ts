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
    const newId = await generateVehicleId();
    const newVehicle = {
      id: newId,
      license_plate: req.body.license_plate,
      vehicle_type_id: req.body.vehicle_type_id || null,
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
    res.status(201).json(created);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/vehicles/:id
router.put('/:id', requireRole(['ADMIN', 'DEVELOPER', 'OFFICER']), async (req, res) => {
  try {
    const updateData: any = {};
    if (req.body.license_plate) updateData.license_plate = req.body.license_plate;
    if (req.body.status) updateData.status = req.body.status;
    if (req.body.mileage !== undefined) updateData.mileage = req.body.mileage;
    if (req.body.last_maintenance_date) updateData.last_maintenance_date = req.body.last_maintenance_date;
    if (req.body.next_maintenance_date) updateData.next_maintenance_date = req.body.next_maintenance_date;

    await db.update('vehicles', req.params.id, updateData);
    const updated = await db.get<Vehicle>('SELECT * FROM vehicles WHERE id = $1', [req.params.id]);
    if (!updated) return res.status(404).json({ error: 'Vehicle not found' });
    res.json(updated);
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
