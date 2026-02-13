/**
 * Backup Service Stub for PostgreSQL
 * File-based backups are not supported in Postgres mode.
 */

// Typed return for createBackup
export async function createBackup(): Promise<{ success: boolean; error?: string; filename?: string; size?: number }> {
    console.warn('⚠️ Backups are not supported in PostgreSQL mode.');
    return { success: false, error: 'Not supported in PostgreSQL mode' };
}

export async function listBackups(): Promise<any[]> {
    return [];
}

export async function cleanupOldBackups() {
    return 0;
}

export async function verifyBackup(path: string): Promise<{ valid: boolean; error?: string; tables?: any[] }> {
    return { valid: false, error: 'Not supported in PostgreSQL mode' };
}

export async function restoreBackup(filename: string): Promise<{ success: boolean; error?: string }> {
    return { success: false, error: 'Not supported in PostgreSQL mode' };
}

export async function getBackupStats() {
    return {
        totalBackups: 0,
        totalSize: 0,
        averageSize: 0,
        oldestBackup: null,
        newestBackup: null
    };
}

export function startAutomaticBackups() {
    console.log('ℹ️ Automatic backups disabled in PostgreSQL mode.');
}

export function stopAutomaticBackups() { }

export const backupConfig = {
    backupDir: '',
    maxBackups: 0,
    intervalHours: 0
};

export default {
    createBackup,
    listBackups,
    cleanupOldBackups,
    verifyBackup,
    restoreBackup,
    getBackupStats,
    startAutomaticBackups,
    stopAutomaticBackups,
    backupConfig
};
