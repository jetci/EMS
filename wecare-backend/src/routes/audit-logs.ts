import express from 'express';
import { authenticateToken, requireRole } from '../middleware/auth';
import { jsonDB } from '../db/jsonDB';
import { auditService } from '../services/auditService';

const router = express.Router();

interface AuditLog {
  id: string;
  timestamp: string;
  userEmail: string;
  userRole: string;
  action: string;
  targetId?: string;
  ipAddress?: string;
  dataPayload?: any;
  hash?: string;
  previousHash?: string;
  sequenceNumber?: number;
}

const initAuditLogs = () => {
  try {
    const logs = jsonDB.read<AuditLog>('audit_logs');
    if (!logs || logs.length === 0) {
      const defaultLogs: AuditLog[] = [
        {
          id: 'LOG-001',
          timestamp: new Date().toISOString(),
          userEmail: 'system@wecare.dev',
          userRole: 'system',
          action: 'SYSTEM_INIT',
          targetId: 'SYSTEM',
          ipAddress: '127.0.0.1'
        }
      ];
      jsonDB.write('audit_logs', defaultLogs);
    }
  } catch (err) {
    console.error('Failed to init audit logs:', err);
  }
};

initAuditLogs();

// GET /api/audit-logs
router.get('/', authenticateToken, requireRole(['admin', 'DEVELOPER']), async (req, res) => {
  try {
    const logs = jsonDB.read<AuditLog>('audit_logs');
    // Sort by timestamp desc
    logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    res.json(logs);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/audit-logs/integrity - Verify audit log integrity
router.get('/integrity', authenticateToken, requireRole(['admin', 'DEVELOPER']), async (req, res) => {
  try {
    const status = auditService.getIntegrityStatus();
    res.json(status);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/audit-logs/verify - Full integrity verification
router.post('/verify', authenticateToken, requireRole(['admin', 'DEVELOPER']), async (req, res) => {
  try {
    const result = auditService.verifyIntegrity();

    // Log the verification attempt
    const currentUser = (req as any).user;
    auditService.log(
      currentUser?.email || 'unknown',
      currentUser?.role || 'unknown',
      'AUDIT_LOG_VERIFICATION',
      undefined,
      { result }
    );

    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/audit-logs/rebuild-chain - Rebuild hash chain (DEVELOPER only)
router.post('/rebuild-chain', authenticateToken, requireRole(['DEVELOPER']), async (req, res) => {
  try {
    const result = auditService.rebuildChain();

    // Log the rebuild attempt
    const currentUser = (req as any).user;
    auditService.log(
      currentUser?.email || 'unknown',
      currentUser?.role || 'unknown',
      'AUDIT_LOG_CHAIN_REBUILD',
      undefined,
      { result }
    );

    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
