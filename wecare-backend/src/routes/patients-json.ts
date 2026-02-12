import express from 'express';
import { sqliteDB } from '../db/sqliteDB';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { transformResponse } from '../utils/caseConverter';

const router = express.Router();

// Helper to generate patient ID
const generatePatientId = (): string => {
    const patients = sqliteDB.all<{ id: string }>('SELECT id FROM patients ORDER BY id DESC LIMIT 1');
    if (patients.length === 0) return 'PAT-001';
    const lastId = patients[0].id;
    if (!lastId || !lastId.includes('-')) return 'PAT-001';
    const num = parseInt(lastId.split('-')[1], 10);
    if (isNaN(num)) return 'PAT-001';
    return `PAT-${String(num + 1).padStart(3, '0')}`;
};

router.use(authenticateToken);

// POST /api/patients/json - create patient (JSON only)
router.post('/json', async (req: AuthRequest, res) => {
    try {
        const newId = generatePatientId();

        // Support both snake_case and camelCase
        const newPatient = {
            id: newId,
            full_name: req.body.full_name || req.body.fullName,
            national_id: req.body.national_id || req.body.nationalId || null,
            dob: req.body.dob || null,
            age: req.body.age || null,
            gender: req.body.gender || null,
            blood_type: req.body.blood_type || req.body.bloodType || null,
            rh_factor: req.body.rh_factor || req.body.rhFactor || null,
            health_coverage: req.body.health_coverage || req.body.healthCoverage || null,
            contact_phone: req.body.contact_phone || req.body.contactPhone || null,

            // Address fields
            id_card_house_number: req.body.id_card_address?.houseNumber || req.body.idCardAddress?.houseNumber || null,
            id_card_village: req.body.id_card_address?.village || req.body.idCardAddress?.village || null,
            id_card_tambon: req.body.id_card_address?.tambon || req.body.idCardAddress?.tambon || null,
            id_card_amphoe: req.body.id_card_address?.amphoe || req.body.idCardAddress?.amphoe || null,
            id_card_changwat: req.body.id_card_address?.changwat || req.body.idCardAddress?.changwat || null,

            current_house_number: req.body.current_address?.houseNumber || req.body.currentAddress?.houseNumber || null,
            current_village: req.body.current_address?.village || req.body.currentAddress?.village || null,
            current_tambon: req.body.current_address?.tambon || req.body.currentAddress?.tambon || null,
            current_amphoe: req.body.current_address?.amphoe || req.body.currentAddress?.amphoe || null,
            current_changwat: req.body.current_address?.changwat || req.body.currentAddress?.changwat || null,

            landmark: req.body.landmark || null,
            latitude: req.body.latitude || null,
            longitude: req.body.longitude || null,

            // Arrays
            patient_types: typeof req.body.patient_types === 'string' ? req.body.patient_types : JSON.stringify(req.body.patient_types || req.body.patientTypes || []),
            chronic_diseases: typeof req.body.chronic_diseases === 'string' ? req.body.chronic_diseases : JSON.stringify(req.body.chronic_diseases || req.body.chronicDiseases || []),
            allergies: typeof req.body.allergies === 'string' ? req.body.allergies : JSON.stringify(req.body.allergies || []),

            profile_image_url: req.body.profile_image_url || req.body.profileImageUrl || null,
            registered_date: new Date().toISOString().split('T')[0],
            created_by: req.user?.id || null
        };

        sqliteDB.insert('patients', newPatient);

        const created = sqliteDB.get<any>('SELECT * FROM patients WHERE id = ?', [newId]);
        const camelCasePatient = transformResponse(created);

        // Parse JSON fields
        ['patientTypes', 'chronicDiseases', 'allergies'].forEach(field => {
            if (typeof camelCasePatient[field] === 'string') {
                try { camelCasePatient[field] = JSON.parse(camelCasePatient[field]); }
                catch { camelCasePatient[field] = []; }
            }
        });

        res.status(201).json(camelCasePatient);
    } catch (err: any) {
        console.error('Error creating patient:', err);
        res.status(500).json({ error: err.message });
    }
});

// PUT /api/patients/json/:id - update patient (JSON only)
router.put('/json/:id', async (req: AuthRequest, res) => {
    try {
        const { id } = req.params;

        const existing = sqliteDB.get<any>('SELECT * FROM patients WHERE id = ?', [id]);
        if (!existing) {
            return res.status(404).json({ error: 'Patient not found' });
        }

        // Check ownership for community users
        if (req.user?.role === 'community' && existing.created_by && existing.created_by !== req.user.id) {
            return res.status(403).json({ error: 'Access denied' });
        }

        const updateData: any = {};

        // Map fields (support both cases)
        if (req.body.full_name || req.body.fullName) updateData.full_name = req.body.full_name || req.body.fullName;
        if (req.body.national_id || req.body.nationalId) updateData.national_id = req.body.national_id || req.body.nationalId;
        if (req.body.dob) updateData.dob = req.body.dob;
        if (req.body.gender) updateData.gender = req.body.gender;
        if (req.body.blood_type || req.body.bloodType) updateData.blood_type = req.body.blood_type || req.body.bloodType;
        if (req.body.rh_factor || req.body.rhFactor) updateData.rh_factor = req.body.rh_factor || req.body.rhFactor;
        if (req.body.health_coverage || req.body.healthCoverage) updateData.health_coverage = req.body.health_coverage || req.body.healthCoverage;
        if (req.body.contact_phone || req.body.contactPhone) updateData.contact_phone = req.body.contact_phone || req.body.contactPhone;

        // Address fields
        const idCardAddr = req.body.id_card_address || req.body.idCardAddress;
        if (idCardAddr) {
            if (idCardAddr.houseNumber) updateData.id_card_house_number = idCardAddr.houseNumber;
            if (idCardAddr.village) updateData.id_card_village = idCardAddr.village;
            if (idCardAddr.tambon) updateData.id_card_tambon = idCardAddr.tambon;
            if (idCardAddr.amphoe) updateData.id_card_amphoe = idCardAddr.amphoe;
            if (idCardAddr.changwat) updateData.id_card_changwat = idCardAddr.changwat;
        }

        const currentAddr = req.body.current_address || req.body.currentAddress;
        if (currentAddr) {
            if (currentAddr.houseNumber) updateData.current_house_number = currentAddr.houseNumber;
            if (currentAddr.village) updateData.current_village = currentAddr.village;
            if (currentAddr.tambon) updateData.current_tambon = currentAddr.tambon;
            if (currentAddr.amphoe) updateData.current_amphoe = currentAddr.amphoe;
            if (currentAddr.changwat) updateData.current_changwat = currentAddr.changwat;
        }

        if (req.body.landmark) updateData.landmark = req.body.landmark;
        if (req.body.latitude) updateData.latitude = req.body.latitude;
        if (req.body.longitude) updateData.longitude = req.body.longitude;

        // Arrays
        if (req.body.patient_types || req.body.patientTypes) {
            const val = req.body.patient_types || req.body.patientTypes;
            updateData.patient_types = typeof val === 'string' ? val : JSON.stringify(val);
        }
        if (req.body.chronic_diseases || req.body.chronicDiseases) {
            const val = req.body.chronic_diseases || req.body.chronicDiseases;
            updateData.chronic_diseases = typeof val === 'string' ? val : JSON.stringify(val);
        }
        if (req.body.allergies) {
            updateData.allergies = typeof req.body.allergies === 'string' ? req.body.allergies : JSON.stringify(req.body.allergies);
        }

        sqliteDB.update('patients', id, updateData);

        const updated = sqliteDB.get<any>('SELECT * FROM patients WHERE id = ?', [id]);
        const camelCasePatient = transformResponse(updated);

        // Parse JSON fields
        ['patientTypes', 'chronicDiseases', 'allergies'].forEach(field => {
            if (typeof camelCasePatient[field] === 'string') {
                try { camelCasePatient[field] = JSON.parse(camelCasePatient[field]); }
                catch { camelCasePatient[field] = []; }
            }
        });

        res.json(camelCasePatient);
    } catch (err: any) {
        console.error('Error updating patient:', err);
        res.status(500).json({ error: err.message });
    }
});

export default router;
