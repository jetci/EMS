import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import sqliteDB from '../db/sqliteDB';

const copyFile = promisify(fs.copyFile);
const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);
const unlink = promisify(fs.unlink);
const mkdir = promisify(fs.mkdir);

/**
 * Database Backup Service
 * Handles automated backups, rotation, and restoration
 */

// Configuration
const DEFAULT_DB_PATH = path.join(__dirname, '..', '..', 'db', 'wecare.db');
const DB_PATH = (() => {
    const stats = sqliteDB.getStats?.();
    const name = stats?.name;
    if (name && name !== ':memory:') return name;

    const envPath = process.env.DB_PATH?.trim();
    if (!envPath) return DEFAULT_DB_PATH;
    return path.isAbsolute(envPath) ? envPath : path.resolve(process.cwd(), envPath);
})();
const BACKUP_DIR = path.join(__dirname, '..', '..', 'backups');
const MAX_BACKUPS = 7; // Keep last 7 backups
const BACKUP_INTERVAL_HOURS = 24; // Backup every 24 hours

// Ensure backup directory exists
async function ensureBackupDir(): Promise<void> {
    try {
        await mkdir(BACKUP_DIR, { recursive: true });
    } catch (error) {
        // Directory might already exist
    }
}

/**
 * Generate backup filename with timestamp
 */
function generateBackupFilename(): string {
    const now = new Date();
    const timestamp = now.toISOString()
        .replace(/:/g, '-')
        .replace(/\..+/, '')
        .replace('T', '_');
    return `wecare_backup_${timestamp}.db`;
}

/**
 * Create a database backup
 */
export async function createBackup(): Promise<{ success: boolean; filename?: string; path?: string; size?: number; error?: string }> {
    try {
        await ensureBackupDir();

        // Generate backup filename
        const backupFilename = generateBackupFilename();
        const backupPath = path.join(BACKUP_DIR, backupFilename);

        console.log('📦 Creating database backup...');
        console.log(`   Source: ${DB_PATH}`);
        console.log(`   Destination: ${backupPath}`);

        // Checkpoint WAL before backup
        console.log('   Checkpointing WAL...');
        sqliteDB.checkpoint('FULL');

        // Copy database file
        await copyFile(DB_PATH, backupPath);

        // Get backup file size
        const stats = await stat(backupPath);
        const sizeInMB = (stats.size / 1024 / 1024).toFixed(2);

        console.log(`✅ Backup created successfully: ${backupFilename} (${sizeInMB}MB)`);

        // Cleanup old backups
        await cleanupOldBackups();

        return {
            success: true,
            filename: backupFilename,
            path: backupPath,
            size: stats.size
        };
    } catch (error) {
        console.error('❌ Backup failed:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        };
    }
}

/**
 * List all available backups
 */
export async function listBackups(): Promise<Array<{ filename: string; path: string; size: number; created: Date }>> {
    try {
        await ensureBackupDir();

        const files = await readdir(BACKUP_DIR);
        const backupFiles = files.filter(f => f.startsWith('wecare_backup_') && f.endsWith('.db'));

        const backups = await Promise.all(
            backupFiles.map(async (filename) => {
                const filePath = path.join(BACKUP_DIR, filename);
                const stats = await stat(filePath);
                return {
                    filename,
                    path: filePath,
                    size: stats.size,
                    created: stats.mtime
                };
            })
        );

        // Sort by creation date (newest first)
        backups.sort((a, b) => b.created.getTime() - a.created.getTime());

        return backups;
    } catch (error) {
        console.error('❌ Failed to list backups:', error);
        return [];
    }
}

/**
 * Delete old backups (keep only MAX_BACKUPS)
 */
export async function cleanupOldBackups(): Promise<number> {
    try {
        const backups = await listBackups();

        if (backups.length <= MAX_BACKUPS) {
            console.log(`ℹ️  No cleanup needed (${backups.length}/${MAX_BACKUPS} backups)`);
            return 0;
        }

        const backupsToDelete = backups.slice(MAX_BACKUPS);
        console.log(`🗑️  Cleaning up ${backupsToDelete.length} old backups...`);

        for (const backup of backupsToDelete) {
            await unlink(backup.path);
            console.log(`   Deleted: ${backup.filename}`);
        }

        console.log(`✅ Cleanup completed: Kept ${MAX_BACKUPS} backups, deleted ${backupsToDelete.length}`);
        return backupsToDelete.length;
    } catch (error) {
        console.error('❌ Cleanup failed:', error);
        return 0;
    }
}

/**
 * Verify backup integrity
 */
export async function verifyBackup(backupPath: string): Promise<{ valid: boolean; error?: string; tables?: number }> {
    try {
        // Try to open the backup database
        const Database = require('better-sqlite3');
        const backupDb = new Database(backupPath, { readonly: true });

        // Check if we can query the database
        const tables = backupDb.prepare("SELECT COUNT(*) as count FROM sqlite_master WHERE type='table'").get() as { count: number };

        // Try to query a critical table
        const userCount = backupDb.prepare("SELECT COUNT(*) as count FROM users").get() as { count: number };

        backupDb.close();

        console.log(`✅ Backup verified: ${tables.count} tables, ${userCount.count} users`);

        return {
            valid: true,
            tables: tables.count
        };
    } catch (error) {
        console.error('❌ Backup verification failed:', error);
        return {
            valid: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        };
    }
}

/**
 * Restore database from backup
 * WARNING: This will replace the current database!
 */
export async function restoreBackup(backupFilename: string): Promise<{ success: boolean; error?: string }> {
    try {
        const backupPath = path.join(BACKUP_DIR, backupFilename);

        // Verify backup exists
        try {
            await stat(backupPath);
        } catch {
            return {
                success: false,
                error: 'Backup file not found'
            };
        }

        // Verify backup integrity
        const verification = await verifyBackup(backupPath);
        if (!verification.valid) {
            return {
                success: false,
                error: `Backup verification failed: ${verification.error}`
            };
        }

        console.log('⚠️  WARNING: Restoring backup will replace current database!');
        console.log(`   Backup: ${backupFilename}`);
        console.log(`   Target: ${DB_PATH}`);

        // Create a safety backup of current database
        const safetyBackupFilename = `wecare_before_restore_${Date.now()}.db`;
        const safetyBackupPath = path.join(BACKUP_DIR, safetyBackupFilename);

        console.log(`   Creating safety backup: ${safetyBackupFilename}`);
        await copyFile(DB_PATH, safetyBackupPath);

        // Close current database connection
        console.log('   Closing database connection...');
        sqliteDB.close();

        // Restore backup
        console.log('   Restoring backup...');
        await copyFile(backupPath, DB_PATH);

        console.log('✅ Backup restored successfully');
        console.log('⚠️  Please restart the server to use the restored database');

        return {
            success: true
        };
    } catch (error) {
        console.error('❌ Restore failed:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        };
    }
}

/**
 * Get backup statistics
 */
export async function getBackupStats(): Promise<{
    totalBackups: number;
    totalSize: number;
    oldestBackup?: Date;
    newestBackup?: Date;
    averageSize: number;
}> {
    const backups = await listBackups();

    if (backups.length === 0) {
        return {
            totalBackups: 0,
            totalSize: 0,
            averageSize: 0
        };
    }

    const totalSize = backups.reduce((sum, b) => sum + b.size, 0);
    const averageSize = totalSize / backups.length;

    return {
        totalBackups: backups.length,
        totalSize,
        oldestBackup: backups[backups.length - 1]?.created,
        newestBackup: backups[0]?.created,
        averageSize
    };
}

/**
 * Schedule automatic backups
 */
let backupInterval: NodeJS.Timeout | null = null;

export function startAutomaticBackups(): void {
    // Disable scheduler in test environment to avoid open handles
    if (process.env.NODE_ENV === 'test') {
        console.log('ℹ️ Test environment: automatic backups disabled');
        return;
    }

    if (backupInterval) {
        console.log('ℹ️  Automatic backups already running');
        return;
    }

    console.log('🔄 Starting automatic backup scheduler...');
    console.log(`   Interval: Every ${BACKUP_INTERVAL_HOURS} hours`);
    console.log(`   Retention: ${MAX_BACKUPS} backups`);

    // Create initial backup
    createBackup();

    // Schedule periodic backups
    backupInterval = setInterval(() => {
        console.log('⏰ Scheduled backup triggered');
        createBackup();
    }, BACKUP_INTERVAL_HOURS * 60 * 60 * 1000);

    console.log('✅ Automatic backup scheduler started');
}

export function stopAutomaticBackups(): void {
    if (backupInterval) {
        clearInterval(backupInterval);
        backupInterval = null;
        console.log('✅ Automatic backup scheduler stopped');
    }
}

// Export configuration
export const backupConfig = {
    backupDir: BACKUP_DIR,
    maxBackups: MAX_BACKUPS,
    intervalHours: BACKUP_INTERVAL_HOURS
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
