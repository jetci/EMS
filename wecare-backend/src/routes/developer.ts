import express from 'express';
import { sqliteDB } from '../db/sqliteDB';
import { authenticateToken } from '../middleware/auth';
import { requireExactRole } from '../middleware/roleProtection';
import { auditService } from '../services/auditService';
import { io } from '../index';

const router = express.Router();

// STRICTLY for DEVELOPER only
router.use(authenticateToken);
router.use(requireExactRole(['DEVELOPER']));

// POST /api/developer/sql
// Execute raw SQL
router.post('/sql', async (req: any, res) => {
    try {
        const { query } = req.query.query ? req.query : req.body;

        if (!query) {
            return res.status(400).json({ error: 'Query is required' });
        }

        // Basic safety check: block simple destructive commands if needed, 
        // but DEVELOPER role usually implies full trust.
        // We will just log it heavily.

        console.warn(`⚠️ RAW SQL EXECUTED BY ${req.user.email}: ${query}`);
        auditService.log(req.user.email, req.user.role, 'EXEC_SQL', 'DB', { query });

        // Detect query type
        const upperQuery = query.trim().toUpperCase();
        if (upperQuery.startsWith('SELECT') || upperQuery.startsWith('PRAGMA')) {
            const results = sqliteDB.all(query);
            res.json({ type: 'SELECT', results, count: results.length });
        } else {
            const result = sqliteDB.exec(query);
            res.json({ type: 'EXEC', result });
        }
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// GET /api/developer/socket-stats
// Get Socket.IO internal stats
router.get('/socket-stats', (req: any, res) => {
    try {
        if (!io) {
            return res.json({ status: 'Socket.IO not initialized' });
        }

        const stats = {
            clientsCount: io.engine.clientsCount,
            pollingClients: 0, // io.engine.clientsCount includes this, detailed drilldown if needed
            wsClients: io.engine.clientsCount,
            rooms: Array.from(io.sockets.adapter.rooms.keys()),
        };

        res.json(stats);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// GET /api/developer/env
// View safe environment variables
router.get('/env', (req: any, res) => {
    try {
        const safeEnv = {
            NODE_ENV: process.env.NODE_ENV,
            PORT: process.env.PORT,
            DB_PATH: 'wecare.db', // Hardcoded for now
            JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '24h',
            CORS_ORIGIN: process.env.CORS_ORIGIN || '*',
            // Do NOT return secrets like JWT_SECRET
        };
        res.json(safeEnv);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
