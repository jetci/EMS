import express from 'express';
import { authenticateToken, requireRole } from '../middleware/auth';
import { sqliteDB } from '../db/sqliteDB';

const router = express.Router();

// Default settings with correct types
const DEFAULT_SETTINGS = {
    appName: 'EMS WeCare',
    organizationName: 'EMS WeCare HQ',
    organizationAddress: '',
    organizationPhone: '',
    contactEmail: 'admin@wecare.ems',
    googleMapsApiKey: '',
    mapCenterLat: 13.7563,
    mapCenterLng: 100.5018,
    developerName: 'System Developer',
    developerTitle: 'Full Stack Engineer',
    logoUrl: '',
    maintenanceMode: false,
    maintenanceMessage: 'ระบบปิดปรับปรุงชั่วคราว ขออภัยในความไม่สะดวก',
    schedulingModel: 'individual' // 'individual' | 'team'
};

// GET /api/admin/settings
router.get('/', authenticateToken, requireRole(['admin', 'DEVELOPER']), async (_req, res) => {
    try {
        const rows = sqliteDB.all<any>('SELECT key, value FROM system_settings');

        // Convert array of {key, value} to object
        const dbSettings = rows.reduce((acc, row) => {
            acc[row.key] = row.value;
            return acc;
        }, {} as Record<string, string>);

        // Merge with defaults and restore types
        const finalSettings = { ...DEFAULT_SETTINGS };

        Object.keys(DEFAULT_SETTINGS).forEach(key => {
            if (dbSettings[key] !== undefined) {
                const defaultVal = (DEFAULT_SETTINGS as any)[key];
                const dbVal = dbSettings[key];

                if (typeof defaultVal === 'boolean') {
                    (finalSettings as any)[key] = dbVal === 'true';
                } else if (typeof defaultVal === 'number') {
                    (finalSettings as any)[key] = Number(dbVal);
                } else {
                    (finalSettings as any)[key] = dbVal;
                }
            }
        });

        res.json(finalSettings);
    } catch (err: any) {
        console.error('Error fetching settings:', err);
        res.status(500).json({ error: err.message });
    }
});

// PUT /api/admin/settings
router.put('/', authenticateToken, requireRole(['admin', 'DEVELOPER']), async (req, res) => {
    try {
        const newSettings = req.body;
        const currentUser = (req as any).user;

        // Transaction to update all settings
        sqliteDB.transaction(() => {
            Object.keys(newSettings).forEach(key => {
                const value = String(newSettings[key]); // Convert to string for storage

                // Check if key exists in defaults (security/integrity check)
                // or allow dynamic keys? safer to only allow known keys or keys that match schema
                // For now allow all keys sent from frontend but ideally should be whitelist

                sqliteDB.db.prepare(`
                    INSERT INTO system_settings (key, value, updated_by, updated_at)
                    VALUES (?, ?, ?, CURRENT_TIMESTAMP)
                    ON CONFLICT(key) DO UPDATE SET
                    value = excluded.value,
                    updated_by = excluded.updated_by,
                    updated_at = CURRENT_TIMESTAMP
                `).run(key, value, currentUser?.id || 'SYSTEM');
            });
        });

        res.json(newSettings);
    } catch (err: any) {
        console.error('Error updating settings:', err);
        res.status(500).json({ error: err.message });
    }
});

export default router;
