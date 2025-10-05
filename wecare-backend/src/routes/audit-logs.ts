import express from 'express';

const router = express.Router();

// Mock audit logs data
const mockAuditLogs = [
  { 
    id: 'LOG-001', 
    timestamp: '2024-09-16T14:32:15Z', 
    userEmail: 'office1@wecare.dev', 
    userRole: 'radio_center', 
    action: 'ASSIGN_DRIVER', 
    targetId: 'RIDE-206', 
    ipAddress: '192.168.1.10',
    dataPayload: { before: { driver: null }, after: { driver: 'Driver One' } }
  },
  { 
    id: 'LOG-002', 
    timestamp: '2024-09-16T14:30:05Z', 
    userEmail: 'community1@wecare.dev', 
    userRole: 'community', 
    action: 'CREATE_PATIENT', 
    targetId: 'PAT-007', 
    ipAddress: '203.0.113.25'
  },
  { 
    id: 'LOG-003', 
    timestamp: '2024-09-16T13:15:40Z', 
    userEmail: 'driver1@wecare.dev', 
    userRole: 'driver', 
    action: 'COMPLETE_RIDE', 
    targetId: 'RIDE-201', 
    ipAddress: '198.51.100.12'
  },
];

// GET /api/audit-logs
router.get('/', async (_req, res) => {
  try {
    res.json(mockAuditLogs);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
