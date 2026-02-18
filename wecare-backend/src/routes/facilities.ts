import express from 'express';
import crypto from 'crypto';
import { db } from '../db';
import { authenticateToken, AuthRequest, requireRole } from '../middleware/auth';
import { auditService } from '../services/auditService';

const router = express.Router();

interface Facility {
  id: string;
  name: string;
  lat: number;
  lng: number;
  facilityType?: string;
  isActive: boolean;
}

const normalizeRole = (role: any): string => String(role || '').trim().toUpperCase();

const canManageFacilities = (req: AuthRequest): boolean => {
  const role = normalizeRole(req.user?.role);
  return role === 'ADMIN' || role === 'DEVELOPER' || role === 'OFFICER' || role === 'RADIO_CENTER';
};

const mapRowToFacility = (row: any): Facility | null => {
  if (!row) return null;

  let coordinates: any = row.coordinates;
  if (typeof coordinates === 'string') {
    try {
      coordinates = JSON.parse(coordinates);
    } catch {
      coordinates = null;
    }
  }

  let properties: any = row.properties;
  if (typeof properties === 'string') {
    try {
      properties = JSON.parse(properties);
    } catch {
      properties = {};
    }
  }

  if (!coordinates || typeof coordinates.lat !== 'number' || typeof coordinates.lng !== 'number') {
    return null;
  }

  const isActive = properties && typeof properties.isActive === 'boolean' ? properties.isActive : true;
  const facilityType = properties && typeof properties.facilityType === 'string' ? properties.facilityType : undefined;

  return {
    id: row.id,
    name: row.name,
    lat: coordinates.lat,
    lng: coordinates.lng,
    facilityType,
    isActive,
  };
};

// GET /api/facilities - list active facilities for all authenticated roles
router.get('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const rows = await db.all<any>('SELECT * FROM map_data WHERE type = $1', ['marker']);
    const facilities = rows
      .map(mapRowToFacility)
      .filter((f): f is Facility => !!f && f.isActive);
    res.json(facilities);
  } catch (err: any) {
    console.error('Fetch facilities error:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/facilities - create new facility (admin/officer/radio_center/developer)
router.post('/', authenticateToken, requireRole(['admin', 'DEVELOPER', 'OFFICER', 'radio_center']), async (req: AuthRequest, res) => {
  try {
    const name = String(req.body.name || '').trim();
    const lat = Number(req.body.lat);
    const lng = Number(req.body.lng);
    const facilityType = req.body.facilityType ? String(req.body.facilityType).trim() : undefined;
    const isActive = req.body.isActive !== false;

    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      return res.status(400).json({ error: 'Valid lat and lng are required' });
    }

    const id = `FAC-${crypto.randomUUID().substring(0, 8)}`;
    const now = new Date().toISOString();
    const currentUser = req.user!;

    const coordinates = { lat, lng };
    const properties = {
      category: 'facility',
      facilityType: facilityType || undefined,
      isActive,
    };

    const newRow = {
      id,
      type: 'marker',
      name,
      description: facilityType || '',
      coordinates: JSON.stringify(coordinates),
      properties: JSON.stringify(properties),
      created_by: currentUser.id,
      created_at: now,
      updated_at: now,
    };

    await db.insert('map_data', newRow);

    const facility = mapRowToFacility({
      ...newRow,
      coordinates,
      properties,
    });

    await auditService.log(
      currentUser.email || 'unknown',
      currentUser.role || 'unknown',
      'CREATE_FACILITY',
      id,
      { name, lat, lng, facilityType, isActive },
    );

    res.status(201).json(facility);
  } catch (err: any) {
    console.error('Create facility error:', err);
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/facilities/:id - update facility
router.put('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    if (!canManageFacilities(req)) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const { id } = req.params;
    const existing = await db.findById('map_data', id);
    if (!existing) {
      return res.status(404).json({ error: 'Facility not found' });
    }

    const existingAny: any = existing;
    let coordinates: any = existingAny.coordinates || {};
    if (typeof coordinates === 'string') {
      try {
        coordinates = JSON.parse(coordinates);
      } catch {
        coordinates = {};
      }
    }

    let properties: any = existingAny.properties || {};
    if (typeof properties === 'string') {
      try {
        properties = JSON.parse(properties);
      } catch {
        properties = {};
      }
    }

    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (req.body.name !== undefined) {
      updateData.name = String(req.body.name || '').trim();
    }

    if (req.body.lat !== undefined || req.body.lng !== undefined) {
      const newLat = req.body.lat !== undefined ? Number(req.body.lat) : Number(coordinates.lat);
      const newLng = req.body.lng !== undefined ? Number(req.body.lng) : Number(coordinates.lng);
      if (!Number.isFinite(newLat) || !Number.isFinite(newLng)) {
        return res.status(400).json({ error: 'Valid lat and lng are required' });
      }
      coordinates = { lat: newLat, lng: newLng };
      updateData.coordinates = JSON.stringify(coordinates);
    }

    if (req.body.facilityType !== undefined) {
      properties.facilityType = String(req.body.facilityType || '').trim();
    }

    if (req.body.isActive !== undefined) {
      properties.isActive = !!req.body.isActive;
    }

    properties.category = 'facility';
    updateData.properties = JSON.stringify(properties);

    await db.update('map_data', id, updateData);

    const updatedRow = await db.findById('map_data', id);
    const facility = mapRowToFacility(updatedRow);

    const currentUser = req.user!;
    await auditService.log(
      currentUser.email || 'unknown',
      currentUser.role || 'unknown',
      'UPDATE_FACILITY',
      id,
      { updates: req.body },
    );

    res.json(facility);
  } catch (err: any) {
    console.error('Update facility error:', err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/facilities/:id - soft delete via isActive flag
router.delete('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    if (!canManageFacilities(req)) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const { id } = req.params;
    const existing = await db.findById('map_data', id);
    if (!existing) {
      return res.status(404).json({ error: 'Facility not found' });
    }

    const existingAny: any = existing;
    let properties: any = existingAny.properties || {};
    if (typeof properties === 'string') {
      try {
        properties = JSON.parse(properties);
      } catch {
        properties = {};
      }
    }

    properties.category = 'facility';
    properties.isActive = false;

    await db.update('map_data', id, {
      properties: JSON.stringify(properties),
      updated_at: new Date().toISOString(),
    });

    const currentUser = req.user!;
    await auditService.log(
      currentUser.email || 'unknown',
      currentUser.role || 'unknown',
      'DELETE_FACILITY',
      id,
    );

    res.status(204).send();
  } catch (err: any) {
    console.error('Delete facility error:', err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
