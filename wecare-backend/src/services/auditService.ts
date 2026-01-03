import { jsonDB } from '../db/jsonDB';
import crypto from 'crypto';

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
        const logs = jsonDB.read<AuditLog>('audit_logs');
        if (logs.length === 0) return null;

        // Sort by sequence number descending
        const sortedLogs = logs.sort((a, b) =>
            (b.sequenceNumber || 0) - (a.sequenceNumber || 0)
        );

        return sortedLogs[0];
    } catch (error) {
        console.error('Error getting last log:', error);
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

            const newId = jsonDB.generateId('audit_logs', 'LOG');
            const sequenceNumber = (lastLogCache?.sequenceNumber || 0) + 1;
            const previousHash = lastLogCache?.hash || '0';

            // Create log entry without hash first
            const logWithoutHash: Omit<AuditLog, 'hash'> = {
                id: newId,
                timestamp: new Date().toISOString(),
                userEmail,
                userRole,
                action,
                targetId,
                dataPayload,
                ipAddress,
                previousHash,
                sequenceNumber
            };

            // Calculate hash
            const hash = calculateHash(logWithoutHash);

            // Create final log entry
            const newLog: AuditLog = {
                ...logWithoutHash,
                hash
            };

            // Save to database
            jsonDB.create('audit_logs', newLog);

            // Update cache
            lastLogCache = { hash, sequenceNumber };

        } catch (error) {
            console.error('Failed to write audit log:', error);
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
            const logs = jsonDB.read<AuditLog>('audit_logs');
            const totalLogs = logs.length;

            if (totalLogs === 0) {
                return { valid: true, totalLogs: 0, verifiedLogs: 0, errors: [] };
            }

            // Sort by sequence number
            const sortedLogs = logs.sort((a: AuditLog, b: AuditLog) =>
                (a.sequenceNumber || 0) - (b.sequenceNumber || 0)
            );

            // Verify each log
            for (let i = 0; i < sortedLogs.length; i++) {
                const log = sortedLogs[i];
                const expectedSequence = i + 1;

                // Check sequence number
                if (log.sequenceNumber !== expectedSequence) {
                    errors.push(`Log ${log.id}: Invalid sequence number (expected ${expectedSequence}, got ${log.sequenceNumber})`);
                    continue;
                }

                // Check previous hash
                const expectedPreviousHash = i === 0 ? '0' : sortedLogs[i - 1].hash;
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
            const logs = jsonDB.read<AuditLog>('audit_logs');

            // Sort by timestamp (original order)
            const sortedLogs = logs.sort((a: AuditLog, b: AuditLog) =>
                new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
            );

            let previousHash = '0';

            for (let i = 0; i < sortedLogs.length; i++) {
                const log = sortedLogs[i];
                const sequenceNumber = i + 1;

                // Update log with new chain data
                const updatedLog: Omit<AuditLog, 'hash'> = {
                    ...log,
                    previousHash,
                    sequenceNumber
                };

                // Calculate new hash
                const hash = calculateHash(updatedLog);

                // Update in database
                jsonDB.update('audit_logs', log.id, {
                    ...updatedLog,
                    hash
                });

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
