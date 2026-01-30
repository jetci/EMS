import express from 'express';
import { authenticateToken, requireRole } from '../middleware/auth';
import { sqliteDB } from '../db/sqliteDB';
import { auditService } from '../services/auditService';

const router = express.Router();

export interface AuditLog {
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

// GET /api/audit-logs
router.get('/', authenticateToken, requireRole(['admin', 'DEVELOPER']), async (req, res) => {
  try {
    const rawLogs = sqliteDB.all<any>('SELECT * FROM audit_logs ORDER BY timestamp DESC');

    // Map DB fields to API interface
    const logs: AuditLog[] = rawLogs.map(log => ({
      id: log.id.toString(),
      timestamp: log.timestamp,
      userEmail: log.user_email,
      userRole: log.user_role,
      action: log.action,
      targetId: log.resource_id,
      ipAddress: log.ip_address,
      dataPayload: log.details ? JSON.parse(log.details) : undefined,
      hash: log.hash,
      previousHash: log.previous_hash,
      sequenceNumber: log.sequence_number
    }));

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
