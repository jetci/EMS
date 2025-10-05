import express from 'express';

const router = express.Router();

// Mock dashboard data
const mockAdminDashboard = {
  totalUsers: 125,
  totalDrivers: 45,
  totalPatients: 380,
  totalRides: 1250,
  activeRides: 12,
  completedToday: 28,
  pendingRides: 5,
};

const mockExecutiveDashboard = {
  monthlyRideData: [
    { label: 'ม.ค.', value: 110 }, 
    { label: 'ก.พ.', value: 125 }, 
    { label: 'มี.ค.', value: 140 },
    { label: 'เม.ย.', value: 130 }, 
    { label: 'พ.ค.', value: 155 }, 
    { label: 'มิ.ย.', value: 160 },
    { label: 'ก.ค.', value: 175 }, 
    { label: 'ส.ค.', value: 180 }, 
    { label: 'ก.ย.', value: 165 },
  ],
  patientDistributionData: [
    { label: 'หมู่ 1', value: 15, color: '#3B82F6' },
    { label: 'หมู่ 2', value: 12, color: '#10B981' },
    { label: 'หมู่ 3', value: 8, color: '#F59E0B' },
    { label: 'หมู่ 4', value: 10, color: '#EF4444' },
    { label: 'หมู่ 5', value: 5, color: '#8B5CF6' },
    { label: 'อื่นๆ', value: 50, color: '#6B7280' },
  ],
  topTripTypesData: [
    { label: 'นัดฟอกไต', value: 85 },
    { label: 'กายภาพบำบัด', value: 62 },
    { label: 'รับยา', value: 55 },
    { label: 'นัดหมอตามปกติ', value: 48 },
    { label: 'ฉุกเฉิน', value: 23 },
  ],
  stats: {
    totalRides: 1250,
    totalPatients: 380,
    totalDrivers: 45,
    efficiency: 92
  }
};

// GET /api/dashboard/admin
router.get('/admin', async (_req, res) => {
  try {
    res.json(mockAdminDashboard);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/dashboard/executive
router.get('/executive', async (_req, res) => {
  try {
    res.json(mockExecutiveDashboard);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
