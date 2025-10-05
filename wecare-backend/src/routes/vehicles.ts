import express from 'express';

const router = express.Router();

// Mock vehicles data
const mockVehicles = [
  { id: 'VEH-001', licensePlate: 'กข-1234', type: 'รถตู้', capacity: 8, status: 'Available', driver: null },
  { id: 'VEH-002', licensePlate: 'กค-5678', type: 'รถกระบะ', capacity: 4, status: 'In Use', driver: 'Driver One' },
  { id: 'VEH-003', licensePlate: 'กง-9012', type: 'รถตู้', capacity: 10, status: 'Available', driver: null },
];

// Mock vehicle types
const mockVehicleTypes = [
  { id: 'VT-001', name: 'รถตู้', capacity: 8, description: 'รถตู้ขนาดกลาง' },
  { id: 'VT-002', name: 'รถกระบะ', capacity: 4, description: 'รถกระบะ 4 ที่นั่ง' },
  { id: 'VT-003', name: 'รถเก๋ง', capacity: 4, description: 'รถเก๋งส่วนบุคคล' },
];

// GET /api/vehicles
router.get('/', async (_req, res) => {
  try {
    res.json(mockVehicles);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/vehicle-types
router.get('/types', async (_req, res) => {
  try {
    res.json(mockVehicleTypes);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/vehicles
router.post('/', async (req, res) => {
  try {
    const newVehicle = {
      id: `VEH-${String(mockVehicles.length + 1).padStart(3, '0')}`,
      ...req.body,
      status: 'Available',
      driver: null
    };
    mockVehicles.push(newVehicle);
    res.status(201).json(newVehicle);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/vehicles/:id
router.put('/:id', async (req, res) => {
  try {
    const index = mockVehicles.findIndex(v => v.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }
    mockVehicles[index] = { ...mockVehicles[index], ...req.body };
    res.json(mockVehicles[index]);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/vehicles/:id
router.delete('/:id', async (req, res) => {
  try {
    const index = mockVehicles.findIndex(v => v.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }
    mockVehicles.splice(index, 1);
    res.status(204).send();
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
