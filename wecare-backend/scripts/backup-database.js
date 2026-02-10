#!/usr/bin/env node

/**
 * Database Backup Script
 * Automatically backs up SQLite database with rotation
 * 
 * Usage:
 *   node scripts/backup-database.js
 * 
 * Schedule with cron (Linux/Mac):
 *   0 2 * * * cd /path/to/wecare-backend && node scripts/backup-database.js
 * 
 * Schedule with Task Scheduler (Windows):
 *   Create task to run: node "D:\EMS\wecare-backend\scripts\backup-database.js"
 */

const fs = require('fs');
const path = require('path');

// Configuration
const DEFAULT_DB_PATH = path.join(__dirname, '../db/wecare.db');
const DB_PATH = (() => {
    const envPath = (process.env.DB_PATH || '').trim();
    if (!envPath) return DEFAULT_DB_PATH;
    return path.isAbsolute(envPath) ? envPath : path.resolve(process.cwd(), envPath);
})();
const BACKUP_DIR = path.join(__dirname, '../backups');
const RETENTION_DAYS = 30; // Keep backups for 30 days
const MAX_BACKUPS = 30; // Maximum number of backups to keep

/**
 * Create backup directory if not exists
 */
function ensureBackupDir() {
    if (!fs.existsSync(BACKUP_DIR)) {
        fs.mkdirSync(BACKUP_DIR, { recursive: true });
        console.log(`✅ Created backup directory: ${BACKUP_DIR}`);
    }
}

/**
 * Generate backup filename with timestamp
 */
function generateBackupFilename() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hour = String(now.getHours()).padStart(2, '0');
    const minute = String(now.getMinutes()).padStart(2, '0');
    const second = String(now.getSeconds()).padStart(2, '0');

    return `wecare-backup-${year}${month}${day}-${hour}${minute}${second}.db`;
}

/**
 * Perform database backup
 */
function backupDatabase() {
    try {
        // Check if database exists
        if (!fs.existsSync(DB_PATH)) {
            console.error(`❌ Database not found: ${DB_PATH}`);
            process.exit(1);
        }

        // Get database file size
        const stats = fs.statSync(DB_PATH);
        const fileSizeInMB = (stats.size / (1024 * 1024)).toFixed(2);

        console.log(`📊 Database size: ${fileSizeInMB} MB`);
        console.log(`📂 Backup directory: ${BACKUP_DIR}`);

        // Generate backup filename
        const backupFilename = generateBackupFilename();
        const backupPath = path.join(BACKUP_DIR, backupFilename);

        console.log(`⏳ Creating backup: ${backupFilename}...`);

        // Copy database file
        fs.copyFileSync(DB_PATH, backupPath);

        // Verify backup
        const backupStats = fs.statSync(backupPath);
        if (backupStats.size === stats.size) {
            console.log(`✅ Backup created successfully!`);
            console.log(`📁 Location: ${backupPath}`);
            console.log(`📊 Size: ${fileSizeInMB} MB`);
            return backupPath;
        } else {
            console.error(`❌ Backup verification failed! Size mismatch.`);
            fs.unlinkSync(backupPath); // Delete corrupted backup
            process.exit(1);
        }
    } catch (error) {
        console.error(`❌ Backup failed: ${error.message}`);
        process.exit(1);
    }
}

/**
 * Clean up old backups based on retention policy
 */
function cleanupOldBackups() {
    try {
        console.log(`\n🧹 Cleaning up old backups...`);

        // Get all backup files
        const files = fs.readdirSync(BACKUP_DIR)
            .filter(file => file.startsWith('wecare-backup-') && file.endsWith('.db'))
            .map(file => ({
                name: file,
                path: path.join(BACKUP_DIR, file),
                mtime: fs.statSync(path.join(BACKUP_DIR, file)).mtime
            }))
            .sort((a, b) => b.mtime - a.mtime); // Sort by date descending (newest first)

        console.log(`📊 Total backups found: ${files.length}`);

        // Calculate cutoff date
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - RETENTION_DAYS);

        let deletedCount = 0;

        // Delete backups older than retention period or exceeding max count
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const shouldDelete = i >= MAX_BACKUPS || file.mtime < cutoffDate;

            if (shouldDelete) {
                fs.unlinkSync(file.path);
                console.log(`🗑️  Deleted old backup: ${file.name}`);
                deletedCount++;
            }
        }

        if (deletedCount > 0) {
            console.log(`✅ Cleaned up ${deletedCount} old backup(s)`);
        } else {
            console.log(`✅ No old backups to clean up`);
        }

        console.log(`📊 Backups remaining: ${files.length - deletedCount}`);
    } catch (error) {
        console.error(`⚠️  Cleanup warning: ${error.message}`);
        // Don't exit on cleanup errors
    }
}

/**
 * List all existing backups
 */
function listBackups() {
    try {
        const files = fs.readdirSync(BACKUP_DIR)
            .filter(file => file.startsWith('wecare-backup-') && file.endsWith('.db'))
            .map(file => {
                const filePath = path.join(BACKUP_DIR, file);
                const stats = fs.statSync(filePath);
                return {
                    name: file,
                    size: (stats.size / (1024 * 1024)).toFixed(2) + ' MB',
                    date: stats.mtime.toISOString()
                };
            })
            .sort((a, b) => new Date(b.date) - new Date(a.date));

        if (files.length > 0) {
            console.log(`\n📋 Available backups:`);
            files.forEach((file, index) => {
                console.log(`   ${index + 1}. ${file.name} (${file.size}) - ${file.date}`);
            });
        } else {
            console.log(`\n📋 No backups found`);
        }
    } catch (error) {
        console.error(`⚠️  Error listing backups: ${error.message}`);
    }
}

/**
 * Main execution
 */
function main() {
    console.log('🔄 Database Backup Script');
    console.log('='.repeat(50));
    console.log(`⏰ Started at: ${new Date().toISOString()}\n`);

    // Ensure backup directory exists
    ensureBackupDir();

    // Perform backup
    const backupPath = backupDatabase();

    // Cleanup old backups
    cleanupOldBackups();

    // List all backups
    listBackups();

    console.log('\n' + '='.repeat(50));
    console.log('✅ Backup process completed successfully!');
    console.log(`⏰ Finished at: ${new Date().toISOString()}`);
}

// Run main function
main();
