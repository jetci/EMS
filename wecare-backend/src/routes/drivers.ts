import express from 'express';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Mock drivers data
const mockDrivers = [
  { id: 'DRV-001', full_name: 'Driver One', phone: '0812345678', status: 'AVAILABLE', vehicle: 'VEH-001', team: 'TEAM-001' },
  { id: 'DRV-002', full_name: 'Driver Two', phone: '0823456789', status: 'ON_TRIP', vehicle: 'VEH-002', team: 'TEAM-001' },
  { id: 'DRV-003', full_name: 'Driver Three', phone: '0834567890', status: 'AVAILABLE', vehicle: 'VEH-003', team: 'TEAM-002' },
];

// GET /api/drivers - fetch all drivers
router.get('/', async (_req, res) => {
  try {
    res.json(mockDrivers);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/drivers/available - fetch available drivers
router.get('/available', async (_req, res) => {
  try {
    const available = mockDrivers.filter(d => d.status === 'AVAILABLE');
    res.json(available);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/drivers/my-rides - fetch today's rides for the logged-in driver (protected)
router.get('/my-rides', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const driverId = req.user?.driver_id;
    if (!driverId) {
      return res.status(403).json({ error: 'Driver ID not found in token/user context' });
    }
    // Mock response
    res.json([]);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
