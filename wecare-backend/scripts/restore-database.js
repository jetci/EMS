#!/usr/bin/env node

/**
 * Database Restore Script
 * Restores SQLite database from backup
 * 
 * Usage:
 *   node scripts/restore-database.js [backup-filename]
 * 
 * Example:
 *   node scripts/restore-database.js wecare-backup-20260107-020000.db
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Configuration
const DEFAULT_DB_PATH = path.join(__dirname, '../db/wecare.db');
const DB_PATH = (() => {
    const envPath = (process.env.DB_PATH || '').trim();
    if (!envPath) return DEFAULT_DB_PATH;
    return path.isAbsolute(envPath) ? envPath : path.resolve(process.cwd(), envPath);
})();
const BACKUP_DIR = path.join(__dirname, '../backups');

/**
 * Create readline interface for user input
 */
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

/**
 * Prompt user for confirmation
 */
function confirm(question) {
    return new Promise((resolve) => {
        rl.question(question, (answer) => {
            resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes');
        });
    });
}

/**
 * List available backups
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

        return files;
    } catch (error) {
        console.error(`❌ Error listing backups: ${error.message}`);
        return [];
    }
}

/**
 * Restore database from backup
 */
async function restoreDatabase(backupFilename) {
    try {
        console.log('🔄 Database Restore Script');
        console.log('='.repeat(50));
        console.log(`⏰ Started at: ${new Date().toISOString()}\n`);

        // If no backup filename provided, list available backups
        if (!backupFilename) {
            console.log('📋 Available backups:');
            const backups = listBackups();

            if (backups.length === 0) {
                console.error('❌ No backups found!');
                process.exit(1);
            }

            backups.forEach((backup, index) => {
                console.log(`   ${index + 1}. ${backup.name} (${backup.size}) - ${backup.date}`);
            });

            console.log('\n⚠️  Usage: node scripts/restore-database.js [backup-filename]');
            process.exit(0);
        }

        // Build backup path
        const backupPath = path.join(BACKUP_DIR, backupFilename);

        // Check if backup exists
        if (!fs.existsSync(backupPath)) {
            console.error(`❌ Backup not found: ${backupFilename}`);
            console.log('\n📋 Available backups:');
            const backups = listBackups();
            backups.forEach((backup, index) => {
                console.log(`   ${index + 1}. ${backup.name}`);
            });
            process.exit(1);
        }

        // Get backup info
        const backupStats = fs.statSync(backupPath);
        const backupSizeMB = (backupStats.size / (1024 * 1024)).toFixed(2);

        console.log(`📁 Backup file: ${backupFilename}`);
        console.log(`📊 Size: ${backupSizeMB} MB`);
        console.log(`📅 Date: ${backupStats.mtime.toISOString()}\n`);

        // Warning
        console.log('⚠️  WARNING: This will replace the current database!');
        console.log('⚠️  All current data will be lost!');
        console.log('⚠️  Make sure to backup current database first if needed.\n');

        // Confirm
        const confirmed = await confirm('❓ Are you sure you want to restore? (y/N): ');

        if (!confirmed) {
            console.log('❌ Restore cancelled by user');
            rl.close();
            process.exit(0);
        }

        // Backup current database before restore
        if (fs.existsSync(DB_PATH)) {
            const currentBackupName = `wecare-before-restore-${Date.now()}.db`;
            const currentBackupPath = path.join(BACKUP_DIR, currentBackupName);

            console.log(`\n💾 Backing up current database to: ${currentBackupName}`);
            fs.copyFileSync(DB_PATH, currentBackupPath);
            console.log('✅ Current database backed up');
        }

        // Restore database
        console.log(`\n⏳ Restoring database from backup...`);
        fs.copyFileSync(backupPath, DB_PATH);

        // Verify restore
        const restoredStats = fs.statSync(DB_PATH);
        if (restoredStats.size === backupStats.size) {
            console.log('✅ Database restored successfully!');
            console.log(`📁 Location: ${DB_PATH}`);
            console.log(`📊 Size: ${backupSizeMB} MB`);
            console.log('\n⚠️  Please restart the backend server for changes to take effect.');
        } else {
            console.error('❌ Restore verification failed! Size mismatch.');
            process.exit(1);
        }

        console.log('\n' + '='.repeat(50));
        console.log('✅ Restore process completed!');
        console.log(`⏰ Finished at: ${new Date().toISOString()}`);

        rl.close();
    } catch (error) {
        console.error(`❌ Restore failed: ${error.message}`);
        rl.close();
        process.exit(1);
    }
}

// Get backup filename from command line arguments
const backupFilename = process.argv[2];

// Run restore
restoreDatabase(backupFilename);
