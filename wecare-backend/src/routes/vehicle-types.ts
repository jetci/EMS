import express from 'express';

const router = express.Router();

// Mock vehicle types data
const mockVehicleTypes = [
  { id: 'VT-001', name: 'รถตู้', capacity: 8, description: 'รถตู้ขนาดกลาง', wheelchairAccessible: true },
  { id: 'VT-002', name: 'รถกระบะ', capacity: 4, description: 'รถกระบะ 4 ที่นั่ง', wheelchairAccessible: false },
  { id: 'VT-003', name: 'รถเก๋ง', capacity: 4, description: 'รถเก๋งส่วนบุคคล', wheelchairAccessible: false },
];

// GET /api/vehicle-types
router.get('/', async (_req, res) => {
  try {
    res.json(mockVehicleTypes);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/vehicle-types
router.post('/', async (req, res) => {
  try {
    const newType = {
      id: `VT-${String(mockVehicleTypes.length + 1).padStart(3, '0')}`,
      ...req.body
    };
    mockVehicleTypes.push(newType);
    res.status(201).json(newType);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/vehicle-types/:id
router.put('/:id', async (req, res) => {
  try {
    const index = mockVehicleTypes.findIndex(t => t.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: 'Vehicle type not found' });
    }
    mockVehicleTypes[index] = { ...mockVehicleTypes[index], ...req.body };
    res.json(mockVehicleTypes[index]);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/vehicle-types/:id
router.delete('/:id', async (req, res) => {
  try {
    const index = mockVehicleTypes.findIndex(t => t.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: 'Vehicle type not found' });
    }
    mockVehicleTypes.splice(index, 1);
    res.status(204).send();
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
