import app from '../wecare-backend/src/index';
import { initializeDatabase } from '../wecare-backend/src/db/postgresDB';

let isInitialized = false;

export default async function handler(req: any, res: any) {
    try {
        // Ensure database is initialized exactly once per cold start
        if (!isInitialized) {
            console.log('🔄 Serverless Cold Start: Initializing Database...');
            await initializeDatabase();
            isInitialized = true;
            console.log('✅ Database Initialized successfully.');
        }

        // Pass the request to Express
        return app(req, res);
    } catch (err) {
        console.error('❌ Vercel Handler Error:', err);
        res.status(500).json({
            error: 'Internal Server Error',
            details: process.env.NODE_ENV === 'development' ? String(err) : undefined
        });
    }
}
