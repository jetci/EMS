import express from 'express';
import { db } from '../db';
// initializeSchema and seedData likely need refactoring too, but for now we import them if they work
// Actually, initializeSchema is likely NOT needed for PG if using migration scripts
import { seedData } from '../db/sqliteDB'; // Fallback or refactor needed
import { authenticateToken, requireRole } from '../middleware/auth';
import { auditService } from '../services/auditService';
import backupService from '../services/backupService';

const router = express.Router();

// Only Admin and Developer can access system tools
router.use(authenticateToken);
router.use(requireRole(['admin', 'DEVELOPER']));

// POST /api/admin/system/reset-db
router.post('/reset-db', async (req: any, res) => {
    try {
        // Guard: Disable in production and behind feature flag
        const isProduction = process.env.NODE_ENV === 'production';
        const enableDevReset = process.env.ENABLE_DEV_DB_RESET === 'true';
        if (isProduction || !enableDevReset) {
            console.warn('⚠️ Reset DB attempted but BLOCKED by environment guard', {
                env: process.env.NODE_ENV,
                enableDevReset
            });
            auditService.log(req.user!.email, req.user!.role, 'SYSTEM_RESET_BLOCKED', 'DB');
            return res.status(403).json({ error: 'Reset DB is disabled in this environment' });
        }

        // Explicit confirmation requirement to prevent accidental/unauthorized deletion
        const requiredPhrase = process.env.RESET_DB_CONFIRM_PHRASE || 'CONFIRM_RESET_DB';
        const confirmPhrase = req.body?.confirm as string | undefined;
        const reason = (req.body?.reason as string | undefined)?.trim();
        if (!confirmPhrase || confirmPhrase !== requiredPhrase || !reason || reason.length < 10) {
            auditService.log(req.user!.email, req.user!.role, 'SYSTEM_RESET_VALIDATION_FAILED', 'DB');
            return res.status(400).json({
                error: 'Reset DB requires explicit confirmation and a detailed reason (>= 10 characters)',
                requiredPhrase
            });
        }

        auditService.log(req.user!.email, req.user!.role, 'SYSTEM_RESET_CONFIRMED', `Reason: ${reason}`);
        console.log('⚠️ System Reset Initiated by', req.user?.email);

        // Safety backup before reset
        console.log('📦 Creating safety backup before database reset...');
        const safetyBackup = await backupService.createBackup();
        if (safetyBackup.success) {
            // Backup is mocked in Postgres mode
            console.log(`✅ Safety backup skipped (Postgres mode)`);
            auditService.log(req.user!.email, req.user!.role, 'SYSTEM_RESET_SAFETY_BACKUP', 'skipped');
        } else {
            console.warn('⚠️ Safety backup failed:', safetyBackup.error);
            auditService.log(req.user!.email, req.user!.role, 'SYSTEM_RESET_SAFETY_BACKUP_FAILED', safetyBackup.error || 'unknown');
        }

        // Whitelist tables to drop (prevent SQL injection & limit scope)
        const allowedTables = [
            'users',
            'patients',
            'rides',
            'drivers',
            'vehicles',
            'vehicle_types',
            'teams',
            'news',
            'audit_logs',
            'system_settings',
            'map_data',
            'ride_events',
            'driver_locations',
            'patient_attachments'
        ];

        console.log(`🗑️ Dropping ${allowedTables.length} tables...`);

        // Drop tables in a transaction (PG supports CASCADE)
        await db.transaction(async (client) => {
            // Drop each table with CASCADE
            for (const tableName of allowedTables) {
                await client.query(`DROP TABLE IF EXISTS "${tableName}" CASCADE`);
            }
        });

        // Initialize schema (PG specific) - We might need to run the schema.postgres.sql
        const schemaPath = require('path').join(__dirname, '../../db/schema.postgres.sql');
        const schemaSql = require('fs').readFileSync(schemaPath, 'utf8');
        await db.query(schemaSql);

        // Seed data
        await seedData(); // This function likely needs to be checked or updated for PG compatibility


        console.log('✅ Database reset completed and baseline schema re-initialized');

        auditService.log(req.user!.email, req.user!.role, 'SYSTEM_RESET', 'DB');
        res.json({ message: 'Database reset successfully' });
    } catch (error: any) {
        console.error('Reset DB Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// POST /api/admin/system/seed-users
router.post('/seed-users', async (req: any, res) => {
    try {
        const isProduction = process.env.NODE_ENV === 'production';
        const enableDevSeed = process.env.ENABLE_DEV_DB_SEED === 'true';
        if (isProduction || !enableDevSeed) {
            console.warn('⚠️ Seed Users attempted but BLOCKED by environment guard', {
                env: process.env.NODE_ENV,
                enableDevSeed
            });
            auditService.log(req.user!.email, req.user!.role, 'SYSTEM_SEED_BLOCKED', 'USERS');
            return res.status(403).json({ error: 'Seed Users is disabled in this environment' });
        }

        await seedData();
        auditService.log(req.user!.email, req.user!.role, 'SYSTEM_SEED', 'USERS');
        res.json({ message: 'Users seeded successfully' });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// GET /api/admin/system/logs
router.get('/logs', async (req: any, res) => {
    try {
        const limit = req.query.limit ? parseInt(req.query.limit as string) : 100;
        const logs = await db.all(
            'SELECT * FROM audit_logs ORDER BY timestamp DESC LIMIT $1',
            [limit]
        );
        res.json(logs);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// GET /api/admin/system/health
router.get('/health', async (req: any, res) => {
    try {
        // Simple health check info
        res.json({
            status: 'ok',
            timestamp: new Date().toISOString(),
            nodeEnv: process.env.NODE_ENV || 'development'
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

export default router;