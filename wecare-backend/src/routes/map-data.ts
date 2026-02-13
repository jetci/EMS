import express from 'express';
import { db } from '../db';
import { authenticateToken, requireRole } from '../middleware/auth';
import { auditService } from '../services/auditService';
import crypto from 'crypto';

const router = express.Router();

export interface MapShape {
    id: string;
    type: 'marker' | 'polyline' | 'polygon';
    name: string;
    description?: string;
    coordinates: any; // GeoJSON style or Google Maps path
    properties?: any;
    created_by: string;
    created_at: string;
    updated_at: string;
}

// Helper to parse JSON fields from DB
const parseShape = (shape: any): MapShape => ({
    ...shape,
    coordinates: typeof shape.coordinates === 'string' ? JSON.parse(shape.coordinates) : (shape.coordinates || {}),
    properties: typeof shape.properties === 'string' ? JSON.parse(shape.properties) : (shape.properties || {}),
    description: shape.description || '' // Ensure description is not null
});

// GET /api/map-data
router.get('/', authenticateToken, async (req, res) => {
    try {
        const shapes = await db.all<any>('SELECT * FROM map_data ORDER BY created_at DESC');
        const parsedShapes = shapes.map(parseShape);
        res.json(parsedShapes);
    } catch (err: any) {
        console.error('Fetch map data error:', err);
        res.status(500).json({ error: err.message });
    }
});

// POST /api/map-data
router.post('/', authenticateToken, requireRole(['admin', 'DEVELOPER', 'OFFICER', 'radio_center']), async (req, res) => {
    try {
        const { type, name, description, coordinates, properties } = req.body;

        if (!type || !coordinates) {
            return res.status(400).json({ error: 'Missing required fields: type, coordinates' });
        }

        const newId = `SHAPE-${crypto.randomUUID().substring(0, 8)}`;
        const now = new Date().toISOString();
        const currentUser = (req as any).user;

        const newShape = {
            id: newId,
            type,
            name: name || `Shape ${newId}`,
            description: description || '',
            coordinates: JSON.stringify(coordinates),
            properties: JSON.stringify(properties || {}),
            created_by: currentUser.id,
            created_at: now,
            updated_at: now
        };

        await db.insert('map_data', newShape);

        // Audit Log
        await auditService.log(
            currentUser.email || 'unknown',
            currentUser.role || 'unknown',
            'CREATE_MAP_SHAPE',
            newId,
            { type, name }
        );

        // Return parsed shape
        res.status(201).json(parseShape(newShape));
    } catch (err: any) {
        console.error('Create map shape error:', err);
        res.status(500).json({ error: err.message });
    }
});

// PUT /api/map-data/:id
router.put('/:id', authenticateToken, requireRole(['admin', 'DEVELOPER', 'OFFICER', 'radio_center']), async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const existing = await db.findById('map_data', id);
        if (!existing) {
            return res.status(404).json({ error: 'Shape not found' });
        }

        const updateData: any = {
            updated_at: new Date().toISOString()
        };

        if (updates.name) updateData.name = updates.name;
        if (updates.description !== undefined) updateData.description = updates.description;
        if (updates.coordinates) updateData.coordinates = JSON.stringify(updates.coordinates);
        if (updates.properties) updateData.properties = JSON.stringify(updates.properties);

        await db.update('map_data', id, updateData);

        // Audit Log
        const currentUser = (req as any).user;
        await auditService.log(
            currentUser.email || 'unknown',
            currentUser.role || 'unknown',
            'UPDATE_MAP_SHAPE',
            id,
            updates
        );

        const updated = await db.findById('map_data', id);
        res.json(parseShape(updated));
    } catch (err: any) {
        console.error('Update map shape error:', err);
        res.status(500).json({ error: err.message });
    }
});

// DELETE /api/map-data/:id
router.delete('/:id', authenticateToken, requireRole(['admin', 'DEVELOPER', 'OFFICER', 'radio_center']), async (req, res) => {
    try {
        const { id } = req.params;

        const existing = await db.findById('map_data', id);
        if (!existing) {
            return res.status(404).json({ error: 'Shape not found' });
        }

        await db.delete('map_data', id);

        // Audit Log
        const currentUser = (req as any).user;
        await auditService.log(
            currentUser.email || 'unknown',
            currentUser.role || 'unknown',
            'DELETE_MAP_SHAPE',
            id
        );

        res.status(204).send();
    } catch (err: any) {
        console.error('Delete map shape error:', err);
        res.status(500).json({ error: err.message });
    }
});

export default router;
