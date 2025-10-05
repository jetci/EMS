import express from 'express';

const router = express.Router();

// Mock rides data
const mockRides: any[] = [
  { id: 'RIDE-001', patient_id: 'PAT-001', patient_name: 'Patient One', driver_id: 'DRV-001', driver_name: 'Driver One', status: 'COMPLETED', appointmentTime: '2024-09-16T09:00:00Z', pickupLocation: 'บ้านผู้ป่วย', dropoffLocation: 'โรงพยาบาล' },
  { id: 'RIDE-002', patient_id: 'PAT-002', patient_name: 'Patient Two', driver_id: 'DRV-002', driver_name: 'Driver Two', status: 'IN_PROGRESS', appointmentTime: '2024-09-16T10:00:00Z', pickupLocation: 'บ้านผู้ป่วย', dropoffLocation: 'คลินิก' },
  { id: 'RIDE-003', patient_id: 'PAT-003', patient_name: 'Patient Three', driver_id: null, driver_name: null, status: 'PENDING', appointmentTime: '2024-09-16T11:00:00Z', pickupLocation: 'บ้านผู้ป่วย', dropoffLocation: 'โรงพยาบาล' },
];

// GET /api/rides - fetch all rides with joined names
router.get('/', async (_req, res) => {
  try {
    res.json(mockRides);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/rides/:id - update ride status and optionally assign driver
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { status, driver_id } = req.body as { status: string; driver_id?: string };
  try {
    const index = mockRides.findIndex(r => r.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Ride not found' });
    }
    mockRides[index] = { ...mockRides[index], status, driver_id: driver_id || null };
    res.json(mockRides[index]);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
