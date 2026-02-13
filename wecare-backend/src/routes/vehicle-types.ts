import express from 'express';
import { authenticateToken, requireRole } from '../middleware/auth';
import { db } from '../db';

const router = express.Router();

interface VehicleType {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  capacity?: number;
  features?: string | string[]; // JSON in DB
}

const generateVehicleTypeId = async (): Promise<string> => {
  const types = await db.all<{ id: string }>('SELECT id FROM vehicle_types ORDER BY id DESC LIMIT 1');
  if (types.length === 0) return 'VT-001';
  const lastId = types[0].id;
  const num = parseInt(lastId.split('-')[1]) + 1;
  return `VT-${String(num).padStart(3, '0')}`;
};

router.use(authenticateToken);

// GET /api/vehicle-types
router.get('/', async (_req, res) => {
  try {
    const types = await db.all<VehicleType>('SELECT * FROM vehicle_types ORDER BY name');
    const parsed = types.map(t => ({
      ...t,
      features: typeof t.features === 'string' ? JSON.parse(t.features) : (t.features || [])
    }));
    res.json(parsed);
  } catch (err: any) {
    console.error('Fetch vehicle types error:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/vehicle-types/:id
router.get('/:id', async (req, res) => {
  try {
    const type = await db.get<VehicleType>('SELECT * FROM vehicle_types WHERE id = $1', [req.params.id]);
    if (!type) return res.status(404).json({ error: 'Vehicle type not found' });
    res.json({
      ...type,
      features: typeof type.features === 'string' ? JSON.parse(type.features) : (type.features || [])
    });
  } catch (err: any) {
    console.error('Fetch vehicle type error:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/vehicle-types
router.post('/', requireRole(['admin', 'DEVELOPER']), async (req, res) => {
  try {
    const newId = await generateVehicleTypeId();
    const newType = {
      id: newId,
      name: req.body.name,
      description: req.body.description || null,
      icon: req.body.icon || null,
      capacity: req.body.capacity || null,
      features: JSON.stringify(req.body.features || [])
    };
    await db.insert('vehicle_types', newType);
    const created = await db.get<VehicleType>('SELECT * FROM vehicle_types WHERE id = $1', [newId]);
    res.status(201).json(created);
  } catch (err: any) {
    console.error('Create vehicle type error:', err);
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/vehicle-types/:id
router.put('/:id', requireRole(['admin', 'DEVELOPER']), async (req, res) => {
  try {
    const updateData: any = {};
    if (req.body.name) updateData.name = req.body.name;
    if (req.body.description !== undefined) updateData.description = req.body.description;
    if (req.body.capacity !== undefined) updateData.capacity = req.body.capacity;
    if (req.body.features) updateData.features = JSON.stringify(req.body.features);
    if (req.body.icon) updateData.icon = req.body.icon;

    await db.update('vehicle_types', req.params.id, updateData);
    const updated = await db.get<VehicleType>('SELECT * FROM vehicle_types WHERE id = $1', [req.params.id]);
    if (!updated) return res.status(404).json({ error: 'Vehicle type not found' });
    res.json(updated);
  } catch (err: any) {
    console.error('Update vehicle type error:', err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/vehicle-types/:id
router.delete('/:id', requireRole(['admin', 'DEVELOPER']), async (req, res) => {
  try {
    await db.delete('vehicle_types', req.params.id);
    res.status(204).send();
  } catch (err: any) {
    console.error('Delete vehicle type error:', err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
