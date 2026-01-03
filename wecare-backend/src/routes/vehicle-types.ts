import express from 'express';
import { authenticateToken, requireRole } from '../middleware/auth';
import { sqliteDB } from '../db/sqliteDB';

const router = express.Router();

interface VehicleType {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  capacity?: number;
  features?: string; // JSON
}

const generateVehicleTypeId = (): string => {
  const types = sqliteDB.all<{ id: string }>('SELECT id FROM vehicle_types ORDER BY id DESC LIMIT 1');
  if (types.length === 0) return 'VT-001';
  const lastId = types[0].id;
  const num = parseInt(lastId.split('-')[1]) + 1;
  return `VT-${String(num).padStart(3, '0')}`;
};

router.use(authenticateToken);

// GET /api/vehicle-types
router.get('/', async (_req, res) => {
  try {
    const types = sqliteDB.all<VehicleType>('SELECT * FROM vehicle_types ORDER BY name');
    const parsed = types.map(t => ({
      ...t,
      features: t.features ? JSON.parse(t.features) : []
    }));
    res.json(parsed);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/vehicle-types/:id
router.get('/:id', async (req, res) => {
  try {
    const type = sqliteDB.get<VehicleType>('SELECT * FROM vehicle_types WHERE id = ?', [req.params.id]);
    if (!type) return res.status(404).json({ error: 'Vehicle type not found' });
    res.json({
      ...type,
      features: type.features ? JSON.parse(type.features) : []
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/vehicle-types
router.post('/', requireRole(['admin', 'DEVELOPER']), async (req, res) => {
  try {
    const newId = generateVehicleTypeId();
    const newType = {
      id: newId,
      name: req.body.name,
      description: req.body.description || null,
      icon: req.body.icon || null,
      capacity: req.body.capacity || null,
      features: JSON.stringify(req.body.features || [])
    };
    sqliteDB.insert('vehicle_types', newType);
    const created = sqliteDB.get<VehicleType>('SELECT * FROM vehicle_types WHERE id = ?', [newId]);
    res.status(201).json(created);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/vehicle-types/:id
router.put('/:id', requireRole(['admin', 'DEVELOPER']), async (req, res) => {
  try {
    const updateData: any = {};
    if (req.body.name) updateData.name = req.body.name;
    if (req.body.description) updateData.description = req.body.description;
    if (req.body.capacity) updateData.capacity = req.body.capacity;
    if (req.body.features) updateData.features = JSON.stringify(req.body.features);

    sqliteDB.update('vehicle_types', req.params.id, updateData);
    const updated = sqliteDB.get<VehicleType>('SELECT * FROM vehicle_types WHERE id = ?', [req.params.id]);
    if (!updated) return res.status(404).json({ error: 'Vehicle type not found' });
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/vehicle-types/:id
router.delete('/:id', requireRole(['admin', 'DEVELOPER']), async (req, res) => {
  try {
    const result = sqliteDB.delete('vehicle_types', req.params.id);
    if (result.changes === 0) return res.status(404).json({ error: 'Vehicle type not found' });
    res.status(204).send();
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
