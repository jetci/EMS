import express from 'express';
import { jsonDB } from '../db/jsonDB';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = express.Router();

const SETTINGS_FILE = 'system_settings';

// GET /api/admin/settings
router.get('/', authenticateToken, requireRole(['admin', 'DEVELOPER']), async (_req, res) => {
    try {
        const settingsList = jsonDB.read<any>(SETTINGS_FILE);
        const settings = settingsList[0] || {};
        res.json(settings);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// PUT /api/admin/settings
router.put('/', authenticateToken, requireRole(['admin', 'DEVELOPER']), async (req, res) => {
    try {
        const settingsList = jsonDB.read<any>(SETTINGS_FILE);
        let currentSettings = settingsList[0] || {};

        const newSettings = { ...currentSettings, ...req.body };

        // Save back as array
        jsonDB.write(SETTINGS_FILE, [newSettings]);

        res.json(newSettings);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
