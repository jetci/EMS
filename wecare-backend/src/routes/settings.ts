import express from 'express';
import { authenticateToken, requireRole } from '../middleware/auth';
import { db } from '../db';

const router = express.Router();

// Default settings with correct types
const DEFAULT_SETTINGS = {
    appName: 'EMS WeCare',
    organizationName: 'EMS WeCare HQ',
    organizationAddress: '',
    organizationPhone: '',
    contactEmail: 'admin@wecare.ems',
    googleMapsApiKey: '',
    mapCenterLat: 19.904394846183447,
    mapCenterLng: 99.19735149982482,
    developerName: 'System Developer',
    developerTitle: 'Full Stack Engineer',
    logoUrl: '',
    maintenanceMode: false,
    maintenanceMessage: 'ระบบปิดปรับปรุงชั่วคราว ขออภัยในความไม่สะดวก',
    schedulingModel: 'individual' // 'individual' | 'team'
};

// GET /api/settings/admin (was /)
router.get('/', authenticateToken, requireRole(['admin', 'DEVELOPER']), async (_req, res) => {
    try {
        const rows = await db.all<any>('SELECT key, value FROM system_settings');

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

// PUT /api/settings/admin (was /)
router.put('/', authenticateToken, requireRole(['admin', 'DEVELOPER']), async (req, res) => {
    try {
        const newSettings = req.body;
        const currentUser = (req as any).user;

        // Transaction to update all settings
        await db.transaction(async (client) => {
            for (const key of Object.keys(newSettings)) {
                const value = String(newSettings[key]);

                // PostgreSQL ON CONFLICT syntax
                await client.query(`
                    INSERT INTO system_settings (key, value, updated_by, updated_at)
                    VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
                    ON CONFLICT(key) DO UPDATE SET
                    value = EXCLUDED.value,
                    updated_by = EXCLUDED.updated_by,
                    updated_at = CURRENT_TIMESTAMP
                `, [key, value, currentUser?.id || 'SYSTEM']);
            }
        });

        res.json(newSettings);
    } catch (err: any) {
        console.error('Error updating settings:', err);
        res.status(500).json({ error: err.message });
    }
});

// Exportable handler for public settings
export const getPublicSettingsHandler = async (_req: express.Request, res: express.Response) => {
    try {
        const rows = await db.all<any>('SELECT key, value FROM system_settings');

        // Convert array of {key, value} to object
        const dbSettings = rows.reduce((acc, row) => {
            acc[row.key] = row.value;
            return acc;
        }, {} as Record<string, string>);

        // Merge with defaults and restore types - only return non-sensitive fields
        const finalSettings = {
            appName: dbSettings['appName'] || DEFAULT_SETTINGS.appName,
            organizationName: dbSettings['organizationName'] || DEFAULT_SETTINGS.organizationName,
            organizationAddress: dbSettings['organizationAddress'] || DEFAULT_SETTINGS.organizationAddress,
            organizationPhone: dbSettings['organizationPhone'] || DEFAULT_SETTINGS.organizationPhone,
            contactEmail: dbSettings['contactEmail'] || DEFAULT_SETTINGS.contactEmail,
            logoUrl: dbSettings['logoUrl'] || DEFAULT_SETTINGS.logoUrl, // Important for landing page
        };

        res.json(finalSettings);
    } catch (err: any) {
        console.error('Error fetching public settings:', err);
        res.status(500).json({ error: err.message });
    }
};

// GET /api/settings/public
router.get('/public', getPublicSettingsHandler);

export default router;
