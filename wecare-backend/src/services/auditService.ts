import { sqliteDB } from '../db/sqliteDB';
import crypto from 'crypto';
import logger from '../utils/logger';

export interface AuditLog {
    id: string;
    timestamp: string;
    userEmail: string;
    userRole: string;
    action: string;
    targetId?: string;
    ipAddress?: string;
    dataPayload?: any;
    hash?: string;           // Hash of this log entry
    previousHash?: string;   // Hash of previous log entry (chain)
    sequenceNumber?: number; // Sequential number for ordering
}

/**
 * Enhanced Audit Service with Hash Chain Integrity
 * Implements blockchain-like hash chain to detect tampering
 */

// In-memory cache of last log for performance
let lastLogCache: { hash: string; sequenceNumber: number } | null = null;

/**
 * Calculate SHA-256 hash of log entry
 */
const calculateHash = (log: Omit<AuditLog, 'hash'>): string => {
    const data = JSON.stringify({
        id: log.id,
        timestamp: log.timestamp,
        userEmail: log.userEmail,
        userRole: log.userRole,
        action: log.action,
        targetId: log.targetId,
        dataPayload: log.dataPayload,
        previousHash: log.previousHash,
        sequenceNumber: log.sequenceNumber
    });

    return crypto.createHash('sha256').update(data).digest('hex');
};

/**
 * Get the last audit log for chain continuation
 */
const getLastLog = (): AuditLog | null => {
    try {
        const log = sqliteDB.get<any>(
            'SELECT * FROM audit_logs ORDER BY sequence_number DESC LIMIT 1'
        );

        if (!log) return null;

        // Parse JSON fields
        return {
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
        };
    } catch (error) {
        logger.error('Error getting last log', { error });
        return null;
    }
};

/**
 * Initialize cache with last log
 */
const initializeCache = () => {
    if (!lastLogCache) {
        const lastLog = getLastLog();
        if (lastLog && lastLog.hash && lastLog.sequenceNumber !== undefined) {
            lastLogCache = {
                hash: lastLog.hash,
                sequenceNumber: lastLog.sequenceNumber
            };
        } else {
            lastLogCache = {
                hash: '0', // Genesis hash
                sequenceNumber: 0
            };
        }
    }
};

export const auditService = {
    /**
     * Log an action with hash chain integrity
     */
    log: (
        userEmail: string,
        userRole: string,
        action: string,
        targetId?: string,
        dataPayload?: any,
        ipAddress?: string
    ) => {
        try {
            // Initialize cache if needed
            initializeCache();

            const sequenceNumber = (lastLogCache?.sequenceNumber || 0) + 1;
            const previousHash = lastLogCache?.hash || '0';
            const timestamp = new Date().toISOString();

            // Create log entry without hash first
            const logWithoutHash: Omit<AuditLog, 'hash' | 'id'> = {
                timestamp,
                userEmail,
                userRole,
                action,
                targetId,
                dataPayload,
                ipAddress,
                previousHash,
                sequenceNumber
            };

            // Calculate hash (use sequenceNumber as temp id for hash calculation)
            const hash = calculateHash({ ...logWithoutHash, id: sequenceNumber.toString() });

            // Insert into SQLite (id will be auto-generated)
            sqliteDB.db.prepare(`
                INSERT INTO audit_logs (
                    user_email, user_role, action, resource_id, 
                    details, ip_address, timestamp,
                    hash, previous_hash, sequence_number
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `).run(
                userEmail,
                userRole,
                action,
                targetId || null,
                dataPayload ? JSON.stringify(dataPayload) : null,
                ipAddress || null,
                timestamp,
                hash,
                previousHash,
                sequenceNumber
            );

            // Update cache
            lastLogCache = { hash, sequenceNumber };

        } catch (error) {
            logger.error('Failed to write audit log', { error });
        }
    },


    /**
     * Verify integrity of entire audit log chain
     */
    verifyIntegrity: (): {
        valid: boolean;
        totalLogs: number;
        verifiedLogs: number;
        errors: string[];
    } => {
        const errors: string[] = [];
        let verifiedLogs = 0;

        try {
            const rawLogs = sqliteDB.all<any>(
                'SELECT * FROM audit_logs ORDER BY sequence_number ASC'
            );
            const totalLogs = rawLogs.length;

            if (totalLogs === 0) {
                return { valid: true, totalLogs: 0, verifiedLogs: 0, errors: [] };
            }

            // Map to AuditLog format
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

            // Verify each log
            for (let i = 0; i < logs.length; i++) {
                const log = logs[i];
                const expectedSequence = i + 1;

                // Check sequence number
                if (log.sequenceNumber !== expectedSequence) {
                    errors.push(`Log ${log.id}: Invalid sequence number (expected ${expectedSequence}, got ${log.sequenceNumber})`);
                    continue;
                }

                // Check previous hash
                const expectedPreviousHash = i === 0 ? '0' : logs[i - 1].hash;
                if (log.previousHash !== expectedPreviousHash) {
                    errors.push(`Log ${log.id}: Invalid previous hash (chain broken)`);
                    continue;
                }

                // Recalculate and verify hash
                const { hash, ...logWithoutHash } = log;
                const calculatedHash = calculateHash(logWithoutHash);

                if (hash !== calculatedHash) {
                    errors.push(`Log ${log.id}: Hash mismatch (log has been tampered with)`);
                    continue;
                }

                verifiedLogs++;
            }

            return {
                valid: errors.length === 0,
                totalLogs,
                verifiedLogs,
                errors
            };

        } catch (error) {
            errors.push(`Fatal error during verification: ${error}`);
            return {
                valid: false,
                totalLogs: 0,
                verifiedLogs: 0,
                errors
            };
        }
    },

    /**
     * Get integrity status summary
     */
    getIntegrityStatus: () => {
        const result = auditService.verifyIntegrity();
        return {
            ...result,
            integrityPercentage: result.totalLogs > 0
                ? Math.round((result.verifiedLogs / result.totalLogs) * 100)
                : 100,
            lastVerified: new Date().toISOString()
        };
    },

    /**
     * Rebuild hash chain (use with caution - only for migration)
     */
    rebuildChain: (): { success: boolean; rebuilt: number; errors: string[] } => {
        const errors: string[] = [];
        let rebuilt = 0;

        try {
            const rawLogs = sqliteDB.all<any>(
                'SELECT * FROM audit_logs ORDER BY timestamp ASC'
            );

            let previousHash = '0';

            for (let i = 0; i < rawLogs.length; i++) {
                const log = rawLogs[i];
                const sequenceNumber = i + 1;

                // Create updated log
                const updatedLog: Omit<AuditLog, 'hash'> = {
                    id: log.id.toString(),
                    timestamp: log.timestamp,
                    userEmail: log.user_email,
                    userRole: log.user_role,
                    action: log.action,
                    targetId: log.resource_id,
                    ipAddress: log.ip_address,
                    dataPayload: log.details ? JSON.parse(log.details) : undefined,
                    previousHash,
                    sequenceNumber
                };

                // Calculate new hash
                const hash = calculateHash(updatedLog);

                // Update in database
                sqliteDB.db.prepare(`
                    UPDATE audit_logs 
                    SET hash = ?, previous_hash = ?, sequence_number = ?
                    WHERE id = ?
                `).run(hash, previousHash, sequenceNumber, log.id);

                previousHash = hash;
                rebuilt++;
            }

            // Reset cache
            lastLogCache = null;
            initializeCache();

            return { success: true, rebuilt, errors: [] };

        } catch (error) {
            errors.push(`Error rebuilding chain: ${error}`);
            return { success: false, rebuilt, errors };
        }
    }
};

