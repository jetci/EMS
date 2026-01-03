import express from 'express';
import { sqliteDB, seedData, initializeSchema } from '../db/sqliteDB';
import { authenticateToken, requireRole } from '../middleware/auth';
import { auditService } from '../services/auditService';

const router = express.Router();

// Only Admin and Developer can access system tools
router.use(authenticateToken);
router.use(requireRole(['admin', 'DEVELOPER']));

// POST /api/admin/system/reset-db
router.post('/reset-db', async (req: any, res) => {
    try {
        console.log('⚠️ System Reset Initiated by', req.user?.email);

        // 1. Drop all tables
        const tables = sqliteDB.all<{ name: string }>("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'");

        sqliteDB.transaction(() => {
            // Disable FK check to allow dropping
            sqliteDB.exec('PRAGMA foreign_keys = OFF');

            for (const table of tables) {
                sqliteDB.exec(`DROP TABLE IF EXISTS ${table.name}`);
            }

            sqliteDB.exec('PRAGMA foreign_keys = ON');
        });

        // 2. Re-init Schema
        initializeSchema();

        // 3. Seed Data
        await seedData();

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
        const logs = sqliteDB.all(
            'SELECT * FROM audit_logs ORDER BY timestamp DESC LIMIT ?',
            [limit]
        );
        res.json(logs);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
