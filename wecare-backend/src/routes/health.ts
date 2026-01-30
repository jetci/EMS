import { Router, Request, Response } from 'express';
import sqliteDB from '../db/sqliteDB';

const router = Router();

/**
 * Health Check Endpoint
 * GET /api/health
 * 
 * Returns system health status including database connection
 */
router.get('/health', (req: Request, res: Response) => {
    try {
        // Check database health
        const dbHealth = sqliteDB.healthCheck();
        const dbStats = sqliteDB.getStats();

        const health = {
            status: dbHealth.healthy ? 'healthy' : 'unhealthy',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            environment: process.env.NODE_ENV || 'development',
            database: {
                healthy: dbHealth.healthy,
                message: dbHealth.message,
                stats: dbHealth.details,
                connection: dbStats
            },
            memory: {
                rss: `${Math.round(process.memoryUsage().rss / 1024 / 1024)}MB`,
                heapTotal: `${Math.round(process.memoryUsage().heapTotal / 1024 / 1024)}MB`,
                heapUsed: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`,
                external: `${Math.round(process.memoryUsage().external / 1024 / 1024)}MB`
            },
            process: {
                pid: process.pid,
                version: process.version,
                platform: process.platform
            }
        };

        const statusCode = dbHealth.healthy ? 200 : 503;
        res.status(statusCode).json(health);
    } catch (error) {
        res.status(503).json({
            status: 'unhealthy',
            timestamp: new Date().toISOString(),
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

/**
 * Database Stats Endpoint
 * GET /api/health/database
 * 
 * Returns detailed database statistics
 */
router.get('/health/database', (req: Request, res: Response) => {
    try {
        const health = sqliteDB.healthCheck();
        const stats = sqliteDB.getStats();

        res.json({
            healthy: health.healthy,
            message: health.message,
            details: health.details,
            connection: stats,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            error: 'Failed to get database stats',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

/**
 * Database Optimization Endpoint
 * POST /api/health/optimize
 * 
 * Runs database optimization (VACUUM and ANALYZE)
 * Requires admin role
 */
router.post('/health/optimize', (req: Request, res: Response) => {
    try {
        const success = sqliteDB.optimize();

        if (success) {
            res.json({
                success: true,
                message: 'Database optimized successfully',
                timestamp: new Date().toISOString()
            });
        } else {
            res.status(500).json({
                success: false,
                message: 'Database optimization failed'
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
 * WAL Checkpoint Endpoint
 * POST /api/health/checkpoint
 * 
 * Triggers WAL checkpoint
 * Requires admin role
 */
router.post('/health/checkpoint', (req: Request, res: Response) => {
    try {
        const mode = (req.body.mode || 'PASSIVE') as 'PASSIVE' | 'FULL' | 'RESTART' | 'TRUNCATE';
        const result = sqliteDB.checkpoint(mode);

        res.json({
            success: true,
            mode,
            result,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

export default router;
