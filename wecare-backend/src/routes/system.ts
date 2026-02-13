import express from 'express';
import { db } from '../db';
import { seedData, initializeSchema, ensureSchema } from '../db/postgresDB';
import { authenticateToken, requireRole } from '../middleware/auth';
import { auditService } from '../services/auditService';
import backupService from '../services/backupService';

const router = express.Router();

/**
 * GET /api/settings/setup-initial-data
 * Public route to initialize the database schema and seed users
 * Use this ONLY for first-time setup or recovery
 */
router.get('/setup-initial-data', async (req, res) => {
    try {
        console.log('🚀 Public DB Init/Seed requested');
        const { ensureSchema } = require('../db/postgresDB');
        await ensureSchema();
        res.json({
            success: true,
            message: 'Database initialized and test accounts seeded successfully. You can now login.',
            testAccounts: 'admin@wecare.ems, Password: password123'
        });
    } catch (error: any) {
        console.error('❌ Public DB Init Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Only Admin and Developer can access other system tools
router.use(authenticateToken);
router.use(requireRole(['admin', 'DEVELOPER']));

/**
 * POST /api/admin/system/init-db
 * Manually trigger database initialization (schema + seeding)
 * This is safer than doing it on every Vercel cold start.
 */
router.post('/init-db', async (req: any, res) => {
    try {
        console.log('🔄 Manual DB Init requested by', req.user?.email);
        await ensureSchema();
        await auditService.log(req.user!.email, req.user!.role, 'SYSTEM_INIT_DB', 'success');
        res.json({ message: 'Database schema and seeding initialized successfully' });
    } catch (error: any) {
        console.error('❌ Manual DB Init Error:', error);
        res.status(500).json({ error: error.message });
    }
});

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
            await auditService.log(req.user!.email, req.user!.role, 'SYSTEM_RESET_BLOCKED', 'DB');
            return res.status(403).json({ error: 'Reset DB is disabled in this environment' });
        }

        // Explicit confirmation requirement
        const requiredPhrase = process.env.RESET_DB_CONFIRM_PHRASE || 'CONFIRM_RESET_DB';
        const confirmPhrase = req.body?.confirm as string | undefined;
        const reason = (req.body?.reason as string | undefined)?.trim();
        if (!confirmPhrase || confirmPhrase !== requiredPhrase || !reason || reason.length < 10) {
            await auditService.log(req.user!.email, req.user!.role, 'SYSTEM_RESET_VALIDATION_FAILED', 'DB');
            return res.status(400).json({
                error: 'Reset DB requires explicit confirmation and a detailed reason (>= 10 characters)',
                requiredPhrase
            });
        }

        await auditService.log(req.user!.email, req.user!.role, 'SYSTEM_RESET_CONFIRMED', `Reason: ${reason}`);
        console.log('⚠️ System Reset Initiated by', req.user?.email);

        // Safety backup before reset
        const safetyBackup = await backupService.createBackup();
        if (safetyBackup.success) {
            console.log(`✅ Safety backup skipped or successful (Postgres mode)`);
            await auditService.log(req.user!.email, req.user!.role, 'SYSTEM_RESET_SAFETY_BACKUP', 'success');
        }

        // Whitelist tables to drop
        const allowedTables = [
            'users', 'patients', 'rides', 'drivers', 'vehicles', 'vehicle_types',
            'teams', 'news', 'audit_logs', 'system_settings', 'map_data',
            'ride_events', 'driver_locations', 'patient_attachments'
        ];

        console.log(`🗑️ Dropping ${allowedTables.length} tables...`);

        // Drop tables with CASCADE
        await db.transaction(async (client) => {
            for (const tableName of allowedTables) {
                await client.query(`DROP TABLE IF EXISTS "${tableName}" CASCADE`);
            }
        });

        // Initialize schema
        await initializeSchema();

        // Seed data
        await seedData();

        console.log('✅ Database reset completed and re-initialized');
        await auditService.log(req.user!.email, req.user!.role, 'SYSTEM_RESET', 'DB');
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
            await auditService.log(req.user!.email, req.user!.role, 'SYSTEM_SEED_BLOCKED', 'USERS');
            return res.status(403).json({ error: 'Seed Users is disabled in this environment' });
        }

        await seedData();
        await auditService.log(req.user!.email, req.user!.role, 'SYSTEM_SEED', 'USERS');
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
        res.json({
            status: 'ok',
            timestamp: new Date().toISOString(),
            nodeEnv: process.env.NODE_ENV || 'development',
            dbType: 'PostgreSQL'
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

export default router;