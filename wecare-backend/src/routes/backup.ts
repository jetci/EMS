import { Router, Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import backupService from '../services/backupService';
import path from 'path';
import fs from 'fs';

const router = Router();

/**
 * Create Manual Backup
 * POST /api/backup/create
 * 
 * Creates an immediate database backup
 * Requires: ADMIN or DEVELOPER role
 */
router.post('/create', async (req: AuthRequest, res: Response) => {
    try {
        console.log(`📦 Manual backup requested by ${req.user?.email}`);

        const result = await backupService.createBackup();

        if (result.success) {
            res.json({
                success: true,
                message: 'Backup created successfully',
                backup: {
                    filename: result.filename,
                    size: result.size,
                    sizeInMB: result.size ? (result.size / 1024 / 1024).toFixed(2) : 0,
                    timestamp: new Date().toISOString()
                }
            });
        } else {
            res.status(500).json({
                success: false,
                error: 'Backup creation failed',
                details: result.error
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

/**
 * List All Backups
 * GET /api/backup/list
 * 
 * Returns list of all available backups
 * Requires: ADMIN or DEVELOPER role
 */
router.get('/list', async (req: AuthRequest, res: Response) => {
    try {
        const backups = await backupService.listBackups();

        const formattedBackups = backups.map(backup => ({
            filename: backup.filename,
            size: backup.size,
            sizeInMB: (backup.size / 1024 / 1024).toFixed(2),
            created: backup.created,
            age: getAge(backup.created)
        }));

        res.json({
            success: true,
            count: backups.length,
            backups: formattedBackups
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

/**
 * Get Backup Statistics
 * GET /api/backup/stats
 * 
 * Returns backup statistics
 * Requires: ADMIN or DEVELOPER role
 */
router.get('/stats', async (req: AuthRequest, res: Response) => {
    try {
        const stats = await backupService.getBackupStats();

        res.json({
            success: true,
            stats: {
                totalBackups: stats.totalBackups,
                totalSize: stats.totalSize,
                totalSizeInMB: (stats.totalSize / 1024 / 1024).toFixed(2),
                averageSize: stats.averageSize,
                averageSizeInMB: (stats.averageSize / 1024 / 1024).toFixed(2),
                oldestBackup: stats.oldestBackup,
                newestBackup: stats.newestBackup,
                config: backupService.backupConfig
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

/**
 * Download Backup File
 * GET /api/backup/download/:filename
 * 
 * Downloads a specific backup file
 * Requires: ADMIN or DEVELOPER role
 */
router.get('/download/:filename', async (req: AuthRequest, res: Response) => {
    try {
        const { filename } = req.params;

        // Validate filename (prevent path traversal)
        if (!filename.startsWith('wecare_backup_') || !filename.endsWith('.db')) {
            return res.status(400).json({
                success: false,
                error: 'Invalid backup filename'
            });
        }

        const backupPath = path.join(backupService.backupConfig.backupDir, filename);

        // Check if file exists
        if (!fs.existsSync(backupPath)) {
            return res.status(404).json({
                success: false,
                error: 'Backup file not found'
            });
        }

        console.log(`📥 Backup download requested: ${filename} by ${req.user?.email}`);

        // Send file
        res.download(backupPath, filename, (err) => {
            if (err) {
                console.error('Download error:', err);
                if (!res.headersSent) {
                    res.status(500).json({
                        success: false,
                        error: 'Download failed'
                    });
                }
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

/**
 * Verify Backup
 * POST /api/backup/verify/:filename
 * 
 * Verifies integrity of a backup file
 * Requires: ADMIN or DEVELOPER role
 */
router.post('/verify/:filename', async (req: AuthRequest, res: Response) => {
    try {
        const { filename } = req.params;

        // Validate filename
        if (!filename.startsWith('wecare_backup_') || !filename.endsWith('.db')) {
            return res.status(400).json({
                success: false,
                error: 'Invalid backup filename'
            });
        }

        const backupPath = path.join(backupService.backupConfig.backupDir, filename);

        console.log(`🔍 Verifying backup: ${filename}`);

        const result = await backupService.verifyBackup(backupPath);

        if (result.valid) {
            res.json({
                success: true,
                message: 'Backup is valid',
                details: {
                    filename,
                    tables: result.tables,
                    verified: true
                }
            });
        } else {
            res.status(400).json({
                success: false,
                error: 'Backup verification failed',
                details: result.error
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

/**
 * Restore Backup
 * POST /api/backup/restore/:filename
 * 
 * Restores database from backup
 * WARNING: This will replace the current database!
 * Requires: DEVELOPER role only (very dangerous operation)
 */
router.post('/restore/:filename', async (req: AuthRequest, res: Response) => {
    try {
        const { filename } = req.params;
        const { confirm } = req.body;

        // Require explicit confirmation
        if (confirm !== 'I understand this will replace the current database') {
            return res.status(400).json({
                success: false,
                error: 'Confirmation required',
                message: 'Please confirm by sending: { "confirm": "I understand this will replace the current database" }'
            });
        }

        // Validate filename
        if (!filename.startsWith('wecare_backup_') || !filename.endsWith('.db')) {
            return res.status(400).json({
                success: false,
                error: 'Invalid backup filename'
            });
        }

        console.log(`⚠️  RESTORE REQUESTED: ${filename} by ${req.user?.email}`);
        console.log('   This will replace the current database!');

        const result = await backupService.restoreBackup(filename);

        if (result.success) {
            res.json({
                success: true,
                message: 'Backup restored successfully',
                warning: 'Please restart the server to use the restored database',
                backup: filename
            });
        } else {
            res.status(500).json({
                success: false,
                error: 'Restore failed',
                details: result.error
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

/**
 * Cleanup Old Backups
 * POST /api/backup/cleanup
 * 
 * Removes old backups (keeps only MAX_BACKUPS)
 * Requires: ADMIN or DEVELOPER role
 */
router.post('/cleanup', async (req: AuthRequest, res: Response) => {
    try {
        console.log(`🗑️  Cleanup requested by ${req.user?.email}`);

        const deletedCount = await backupService.cleanupOldBackups();

        res.json({
            success: true,
            message: `Cleanup completed`,
            deletedBackups: deletedCount,
            keptBackups: backupService.backupConfig.maxBackups
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

// Helper function to calculate age
function getAge(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) {
        return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
    } else if (diffHours < 24) {
        return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    } else {
        return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    }
}

export default router;
