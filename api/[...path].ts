import app from '../wecare-backend/dist/index';
import { initializeDatabase } from '../wecare-backend/dist/db/postgresDB';

let isInitialized = false;

export default async function handler(req: any, res: any) {
    try {
        // Log environment status (sanitize for safety)
        const envStatus = {
            NODE_ENV: process.env.NODE_ENV,
            VERCEL: process.env.VERCEL,
            HAS_DB_URL: !!process.env.DATABASE_URL,
            HAS_JWT_SECRET: !!process.env.JWT_SECRET
        };
        console.log('🔍 Handler Invocation:', {
            method: req.method,
            url: req.url,
            env: envStatus
        });

        if (!process.env.DATABASE_URL) {
            throw new Error('CRITICAL: DATABASE_URL is missing from Vercel environment variables.');
        }

        // Initialize Database in background (non-blocking for the first request)
        if (!isInitialized) {
            initializeDatabase().catch(err => console.error('⚠️ Lazy DB Init Error:', err));
            isInitialized = true;
        }

        // Pass the request to Express
        return app(req, res);
    } catch (err: any) {
        console.error('❌ Vercel Handler Error:', err);
        res.status(500).json({
            error: 'Internal Server Error',
            message: err.message,
            code: 'FUNCTION_INVOCATION_FAILED',
            details: process.env.NODE_ENV === 'development' ? String(err.stack) : undefined
        });
    }
}
