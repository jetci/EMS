import express from 'express';
import { db } from '../db';
import { authenticateToken, AuthRequest, requireRole } from '../middleware/auth';
import { auditService } from '../services/auditService';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { validatePatientData, validateJSON } from '../utils/validators';
import { checkDuplicatePatient } from '../middleware/idempotency';
import { parsePaginationParams, createPaginatedResponse } from '../utils/pagination';
import { transformResponse } from '../utils/caseConverter';
import { patientCreateSchema, patientUpdateSchema, validateRequest } from '../middleware/joiValidation';

const router = express.Router();

// File upload configuration with security validation
const ALLOWED_FILE_TYPES = {
  images: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  documents: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
};

const ALLOWED_MIMETYPES = [...ALLOWED_FILE_TYPES.images, ...ALLOWED_FILE_TYPES.documents];

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB per file
const MAX_FILES = 5; // Maximum 5 files per upload

// Configure Multer with security validation
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads/patients');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Sanitize filename to prevent path traversal
    const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(sanitizedName);
    const basename = path.basename(sanitizedName, ext);
    cb(null, `${basename}-${uniqueSuffix}${ext}`);
  }
});

// File filter for validation
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Check file type
  if (!ALLOWED_MIMETYPES.includes(file.mimetype)) {
    const error = new Error(
      `Invalid file type: ${file.mimetype}. Allowed types: JPEG, PNG, WEBP, PDF, DOC, DOCX`
    ) as any;
    error.code = 'INVALID_FILE_TYPE';
    return cb(error);
  }

  // Check file extension matches mimetype
  const ext = path.extname(file.originalname).toLowerCase();
  const validExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.pdf', '.doc', '.docx'];

  if (!validExtensions.includes(ext)) {
    const error = new Error(
      `Invalid file extension: ${ext}. Allowed: ${validExtensions.join(', ')}`
    ) as any;
    error.code = 'INVALID_FILE_EXTENSION';
    return cb(error);
  }

  // Additional security: Check for double extensions (e.g., file.pdf.exe)
  const filename = file.originalname.toLowerCase();
  const dangerousExtensions = ['.exe', '.bat', '.cmd', '.sh', '.php', '.js', '.jar'];

  for (const dangerousExt of dangerousExtensions) {
    if (filename.includes(dangerousExt)) {
      const error = new Error(
        `Dangerous file extension detected: ${dangerousExt}`
      ) as any;
      error.code = 'DANGEROUS_FILE';
      return cb(error);
    }
  }

  cb(null, true);
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: MAX_FILES
  },
  fileFilter: fileFilter
});

// Patient interface matching SQLite schema
interface Patient {
  id: string;
  full_name: string;
  national_id?: string;
  dob?: string;
  age?: number;
  gender?: string;
  blood_type?: string;
  rh_factor?: string;
  health_coverage?: string;
  contact_phone?: string;

  // Address fields
  current_house_number?: string;
  current_village?: string;
  current_tambon?: string;
  current_amphoe?: string;
  current_changwat?: string;

  // Location
  landmark?: string;
  latitude?: string;
  longitude?: string;

  // Medical info (JSON strings)
  patient_types?: string;
  chronic_diseases?: string;
  allergies?: string;

  // Metadata
  profile_image_url?: string;
  registered_date?: string;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
}

// Helper to generate patient ID
const generatePatientId = async (): Promise<string> => {
  // Get the maximum numeric ID from patients with format PAT-XXX
  // We use CAST and SUBSTRING to extract the number and ignore non-numeric IDs like PAT-NaN
  const result = await db.get<{ max_id: number }>(
    "SELECT MAX(CAST(SUBSTRING(id FROM 5) AS INTEGER)) as max_id FROM patients WHERE id ~ '^PAT-[0-9]+'"
  );
  const nextNum = (result?.max_id || 0) + 1;
  return `PAT-${String(nextNum).padStart(3, '0')}`;
};

// Apply authentication to all routes
router.use(authenticateToken);

// Helper to map DB snake_case to API camelCase
const mapPatientToResponse = (p: any, attachments: any[] = []) => {
  // Parse full_name to get firstName and lastName
  const nameParts = (p.full_name || '').trim().split(' ');
  const firstName = nameParts[0] || '';
  const lastName = nameParts.slice(1).join(' ') || '';

  return {
    id: p.id,

    // Personal Info
    title: p.title || null,  // คำนำหน้า
    fullName: p.full_name,
    firstName: p.first_name || firstName,  // ชื่อ
    lastName: p.last_name || lastName,     // นามสกุล
    nationalId: p.national_id,  // เลขบัตร
    dob: p.dob,  // วันเกิด
    age: p.age,  // อายุ
    gender: p.gender,  // เพศ

    // Medical Info
    bloodType: p.blood_type,  // กรุ๊ปเลือด
    rhFactor: p.rh_factor,    // Rh Factor
    healthCoverage: p.health_coverage,  // สิทธิการรักษา
    contactPhone: p.contact_phone,  // เบอร์โทร

    // ✅ FIX: Registered Address (ที่อยู่ตามบัตรประชาชน)
    registeredAddress: {
      houseNumber: p.id_card_house_number,
      village: p.id_card_village,
      tambon: p.id_card_tambon,
      amphoe: p.id_card_amphoe,
      changwat: p.id_card_changwat
    },

    // Current Address (ที่อยู่ปัจจุบัน)
    currentAddress: {
      houseNumber: p.current_house_number,
      village: p.current_village,
      tambon: p.current_tambon,
      amphoe: p.current_amphoe,
      changwat: p.current_changwat
    },

    // Location (ตำแหน่งที่อยู่)
    landmark: p.landmark,
    latitude: p.latitude,
    longitude: p.longitude,

    // Emergency Contact
    emergencyContact: {
      name: p.emergency_contact_name || null,
      phone: p.emergency_contact_phone || null,
      relation: p.emergency_contact_relation || null
    },

    // Medical (Parse JSON if string)
    patientTypes: p.patient_types ? (typeof p.patient_types === 'string' ? JSON.parse(p.patient_types) : p.patient_types) : [],  // ประเภทผู้ป่วย
    chronicDiseases: p.chronic_diseases ? (typeof p.chronic_diseases === 'string' ? JSON.parse(p.chronic_diseases) : p.chronic_diseases) : [],  // โรคประจำตัว
    allergies: p.allergies ? (typeof p.allergies === 'string' ? JSON.parse(p.allergies) : p.allergies) : [],  // แพ้ยา/อาหาร

    // Metadata
    profileImageUrl: p.profile_image_url,  // รูปภาพ
    registeredDate: p.registered_date,
    createdBy: p.created_by,
    keyInfo: p.key_info || null,
    caregiverName: p.caregiver_name || null,
    caregiverPhone: p.caregiver_phone || null,

    // Attachments (เอกสารแนบ)
    attachments: attachments.map(a => ({
      id: a.id,
      name: a.file_name,
      url: a.file_path,
      type: a.file_type,
      size: a.file_size
    }))
  };
};


// GET /api/patients - fetch patients (filtered by created_by for community users)
router.get('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    // Parse pagination parameters
    const { page, limit, offset } = parsePaginationParams(req.query);

    const rawRole = String(req.user?.role || '').trim().toUpperCase();
    const role = rawRole === 'OFFICE' ? 'OFFICER' : rawRole === 'RADIO' ? 'RADIO_CENTER' : rawRole;

    // Build WHERE clause
    let whereClause = 'WHERE deleted_at IS NULL';
    const params: any[] = [];

    // Filter by created_by if user is community role
    if (role === 'COMMUNITY' && req.user?.id) {
      whereClause += ' AND created_by = $1';
      params.push(req.user.id);
    } else if (
      role !== 'ADMIN' &&
      role !== 'DEVELOPER' &&
      role !== 'RADIO_CENTER' &&
      role !== 'OFFICER' &&
      role !== 'EXECUTIVE'
    ) {
      // If not an authorized role, deny access to full list
      return res.status(403).json({ error: 'Access denied' });
    }

    // Get total count
    const countSql = `SELECT COUNT(*) as count FROM patients ${whereClause}`;
    const countResult = await db.get<{ count: number }>(countSql, params);
    const total = countResult?.count || 0;

    // Get paginated data
    // Note: params are re-spread, and limit/offset are added as next params ($N+1, $N+2)
    // db.all implementation handles params array automatically if passed correctly?
    // Actually we need to make sure params are numbered $1, $2... which simple replacement might imply query modification if we manually built string.
    // BUT db.all helper in postgresDB implementation likely assumes placeholders?
    // db.all signature: (sql, params).
    // The previous implementation used sqliteDB.all(sql, [...params, limit, offset]).
    // For Postgres we need numbered params.
    // If whereClause was built with $1, we need to continue numbering.
    const limitOffsetParams = [...params, limit, offset];

    // We need to rebuild the SQL to use correct $N placeholders for LIMIT and OFFSET
    // Currently whereClause uses $1 (maybe).
    const startParamIndex = params.length + 1;
    const limitParam = `$${startParamIndex}`;
    const offsetParam = `$${startParamIndex + 1}`;

    const dataSql = `SELECT * FROM patients ${whereClause} ORDER BY registered_date DESC LIMIT ${limitParam} OFFSET ${offsetParam}`;
    const patients = await db.all<any>(dataSql, limitOffsetParams);

    // Transform using unified response mapper
    const transformedPatients = patients.map(p => mapPatientToResponse(p, []));

    // Return paginated response (already in camelCase)
    const paginatedResponse = createPaginatedResponse(transformedPatients, page, limit, total);
    res.json(paginatedResponse);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/patients/:id - fetch single patient (with attachments)
router.get('/:id', async (req: AuthRequest, res) => {
  const { id } = req.params;
  try {
    const patient = await db.get<any>('SELECT * FROM patients WHERE id = $1 AND deleted_at IS NULL', [id]);
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    const rawRole = String(req.user?.role || '').trim().toUpperCase();
    const role = rawRole === 'OFFICE' ? 'OFFICER' : rawRole === 'RADIO' ? 'RADIO_CENTER' : rawRole;

    if (role === 'COMMUNITY' && patient.created_by && patient.created_by !== req.user?.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const attachments = await db.all<any>('SELECT * FROM patient_attachments WHERE patient_id = $1', [id]);
    const mappedPatient = mapPatientToResponse(patient, attachments);
    res.json(mappedPatient);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/patients - create new patient
router.post(
  '/',
  upload.fields([{ name: 'profileImage', maxCount: 1 }, { name: 'attachments', maxCount: 5 }]),
  validateRequest(patientCreateSchema),
  checkDuplicatePatient,
  async (req: AuthRequest, res) => {
    try {
      // Validate latitude/longitude if provided
      const { latitude, longitude } = req.body;
      if (latitude && longitude) {
        const lat = Number(latitude);
        const lng = Number(longitude);
        if (
          Number.isNaN(lat) ||
          Number.isNaN(lng) ||
          lat < -90 || lat > 90 ||
          lng < -180 || lng > 180
        ) {
          return res.status(400).json({ error: 'Invalid latitude/longitude' });
        }
      }

      const newId = await generatePatientId();

      // Parse JSON strings from FormData with validation
      let currentAddress: any = {};
      try {
        currentAddress = req.body.currentAddress ? JSON.parse(req.body.currentAddress) : {};
      } catch (e) {
        return res.status(400).json({ error: 'Invalid JSON in currentAddress field' });
      }

      // ✅ FIX: Parse idCardAddress
      let idCardAddress: any = {};
      try {
        idCardAddress = req.body.idCardAddress ? JSON.parse(req.body.idCardAddress) : {};
      } catch (e) {
        return res.status(400).json({ error: 'Invalid JSON in idCardAddress field' });
      }

      let patientTypes = [];
      try {
        if (req.body.patientTypes) {
          validateJSON('patientTypes', req.body.patientTypes);
          patientTypes = JSON.parse(req.body.patientTypes);
        }
      } catch (e: any) {
        return res.status(400).json({ error: e.message || 'Invalid JSON in patientTypes field' });
      }

      let chronicDiseases = [];
      try {
        if (req.body.chronicDiseases) {
          validateJSON('chronicDiseases', req.body.chronicDiseases);
          chronicDiseases = JSON.parse(req.body.chronicDiseases);
        }
      } catch (e: any) {
        return res.status(400).json({ error: e.message || 'Invalid JSON in chronicDiseases field' });
      }

      let allergies = [];
      try {
        if (req.body.allergies) {
          validateJSON('allergies', req.body.allergies);
          allergies = JSON.parse(req.body.allergies);
        }
      } catch (e: any) {
        return res.status(400).json({ error: e.message || 'Invalid JSON in allergies field' });
      }

      // Handle Profile Image
      let profileImageUrl = req.body.profileImageUrl || null;
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      if (files && files['profileImage'] && files['profileImage'][0]) {
        profileImageUrl = '/uploads/patients/' + files['profileImage'][0].filename;
      }

      const newPatient = {
        id: newId,
        title: req.body.title || null,
        full_name: req.body.fullName,
        national_id: req.body.nationalId || null,
        dob: req.body.dob || null,
        age: req.body.age || null,
        gender: req.body.gender || null,
        blood_type: req.body.bloodType || null,
        rh_factor: req.body.rhFactor || null,
        health_coverage: req.body.healthCoverage || null,
        contact_phone: req.body.contactPhone || null,
        key_info: req.body.keyInfo || null,
        caregiver_name: req.body.caregiverName || null,
        caregiver_phone: req.body.caregiverPhone || null,

        // Registered Address (ID Card)
        id_card_house_number: idCardAddress.houseNumber || null,
        id_card_village: idCardAddress.village || null,
        id_card_tambon: idCardAddress.tambon || null,
        id_card_amphoe: idCardAddress.amphoe || null,
        id_card_changwat: idCardAddress.changwat || null,

        // Current Address
        current_house_number: currentAddress.houseNumber || null,
        current_village: currentAddress.village || null,
        current_tambon: currentAddress.tambon || null,
        current_amphoe: currentAddress.amphoe || null,
        current_changwat: currentAddress.changwat || null,

        // Location
        landmark: req.body.landmark || null,
        latitude: req.body.latitude || null,
        longitude: req.body.longitude || null,

        // Emergency Contact
        emergency_contact_name: req.body.emergencyContactName || null,
        emergency_contact_phone: req.body.emergencyContactPhone || null,
        emergency_contact_relation: req.body.emergencyContactRelation || null,

        // Medical info (stringify arrays)
        patient_types: JSON.stringify(patientTypes),
        chronic_diseases: JSON.stringify(chronicDiseases),
        allergies: JSON.stringify(allergies),

        // Metadata
        profile_image_url: profileImageUrl,
        registered_date: new Date().toISOString().split('T')[0],
        created_by: req.user?.id || null
      };

      await db.insert('patients', newPatient);

      // Handle Attachments
      if (files && files['attachments']) {
        for (const file of files['attachments']) {
          const attachmentId = crypto.randomUUID();
          await db.insert('patient_attachments', {
            id: attachmentId,
            patient_id: newId,
            file_name: file.originalname,
            file_path: '/uploads/patients/' + file.filename,
            file_type: file.mimetype,
            file_size: file.size
          });
        }
      }

      // Audit Log
      if (req.user) {
        auditService.log(
          req.user.email || 'unknown',
          req.user.role || 'unknown',
          'CREATE_PATIENT',
          newId,
          { fullName: newPatient.full_name }
        );
      }

      const created = await db.get<any>('SELECT * FROM patients WHERE id = $1 AND deleted_at IS NULL', [newId]);

      // Unified response
      const mappedPatient = mapPatientToResponse(created, []);
      res.status(201).json(mappedPatient);
    } catch (err: any) {
      console.error('Error creating patient:', err);
      res.status(500).json({ error: err.message });
    }
  }
);

// PUT /api/patients/:id - update patient
router.put(
  '/:id',
  upload.fields([{ name: 'profileImage', maxCount: 1 }, { name: 'attachments', maxCount: 5 }]),
  validateRequest(patientUpdateSchema),
  async (req: AuthRequest, res) => {
    const { id } = req.params;
    try {
      const existing = await db.get<Patient>('SELECT * FROM patients WHERE id = $1 AND deleted_at IS NULL', [id]);
      if (!existing) {
        return res.status(404).json({ error: 'Patient not found' });
      }

      // Check ownership for community users
      const rawRole = String(req.user?.role || '').trim().toUpperCase();
      const role = rawRole === 'OFFICE' ? 'OFFICER' : rawRole === 'RADIO' ? 'RADIO_CENTER' : rawRole;

      if (role === 'COMMUNITY' && existing.created_by && existing.created_by !== req.user?.id) {
        return res.status(403).json({ error: 'Access denied' });
      }

      // Validate latitude/longitude if provided in update
      const { latitude, longitude } = req.body;
      if (latitude && longitude) {
        const lat = Number(latitude);
        const lng = Number(longitude);
        if (
          Number.isNaN(lat) ||
          Number.isNaN(lng) ||
          lat < -90 || lat > 90 ||
          lng < -180 || lng > 180
        ) {
          return res.status(400).json({ error: 'Invalid latitude/longitude' });
        }
      }

      const updateData: any = {};
      if (req.body.title) updateData.title = req.body.title;
      if (req.body.fullName) updateData.full_name = req.body.fullName;
      if (req.body.nationalId) updateData.national_id = req.body.nationalId;
      if (req.body.dob) updateData.dob = req.body.dob;
      if (req.body.age) updateData.age = req.body.age;
      if (req.body.gender) updateData.gender = req.body.gender;
      if (req.body.bloodType) updateData.blood_type = req.body.bloodType;
      if (req.body.rhFactor) updateData.rh_factor = req.body.rhFactor;
      if (req.body.healthCoverage) updateData.health_coverage = req.body.healthCoverage;
      if (req.body.contactPhone) updateData.contact_phone = req.body.contactPhone;
      if (req.body.keyInfo) updateData.key_info = req.body.keyInfo;
      if (req.body.caregiverName) updateData.caregiver_name = req.body.caregiverName;
      if (req.body.caregiverPhone) updateData.caregiver_phone = req.body.caregiverPhone;

      // Address (Parse JSON)
      if (req.body.currentAddress) {
        try {
          const addr = JSON.parse(req.body.currentAddress);
          if (addr.houseNumber) updateData.current_house_number = addr.houseNumber;
          if (addr.village) updateData.current_village = addr.village;
          if (addr.tambon) updateData.current_tambon = addr.tambon;
          if (addr.amphoe) updateData.current_amphoe = addr.amphoe;
          if (addr.changwat) updateData.current_changwat = addr.changwat;
        } catch (e) { }
      }

      // Registered Address (ID Card)
      if (req.body.idCardAddress) {
        try {
          const idAddr = JSON.parse(req.body.idCardAddress);
          if (idAddr.houseNumber) updateData.id_card_house_number = idAddr.houseNumber;
          if (idAddr.village) updateData.id_card_village = idAddr.village;
          if (idAddr.tambon) updateData.id_card_tambon = idAddr.tambon;
          if (idAddr.amphoe) updateData.id_card_amphoe = idAddr.amphoe;
          if (idAddr.changwat) updateData.id_card_changwat = idAddr.changwat;
        } catch (e) { }
      }

      // Location
      if (req.body.latitude) updateData.latitude = req.body.latitude;
      if (req.body.longitude) updateData.longitude = req.body.longitude;
      if (req.body.landmark) updateData.landmark = req.body.landmark;

      // Medical info (validate JSON strings)
      if (req.body.patientTypes) {
        try { validateJSON('patientTypes', req.body.patientTypes); } catch (e: any) { return res.status(400).json({ error: e.message }); }
        updateData.patient_types = req.body.patientTypes;
      }
      if (req.body.chronicDiseases) {
        try { validateJSON('chronicDiseases', req.body.chronicDiseases); } catch (e: any) { return res.status(400).json({ error: e.message }); }
        updateData.chronic_diseases = req.body.chronicDiseases;
      }
      if (req.body.allergies) {
        try { validateJSON('allergies', req.body.allergies); } catch (e: any) { return res.status(400).json({ error: e.message }); }
        updateData.allergies = req.body.allergies;
      }

      // Emergency Contact
      if (req.body.emergencyContactName) updateData.emergency_contact_name = req.body.emergencyContactName;
      if (req.body.emergencyContactPhone) updateData.emergency_contact_phone = req.body.emergencyContactPhone;
      if (req.body.emergencyContactRelation) updateData.emergency_contact_relation = req.body.emergencyContactRelation;

      // Handle Profile Image
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      if (files && files['profileImage'] && files['profileImage'][0]) {
        updateData.profile_image_url = '/uploads/patients/' + files['profileImage'][0].filename;
      }
      if (req.body.profileImageUrl) {
        updateData.profile_image_url = req.body.profileImageUrl;
      }

      await db.update('patients', id, updateData);

      // Handle New Attachments
      if (files && files['attachments']) {
        for (const file of files['attachments']) {
          const attachmentId = crypto.randomUUID();
          await db.insert('patient_attachments', {
            id: attachmentId,
            patient_id: id,
            file_name: file.originalname,
            file_path: '/uploads/patients/' + file.filename,
            file_type: file.mimetype,
            file_size: file.size
          });
        }
      }

      // Audit Log
      if (req.user) {
        auditService.log(
          req.user.email || 'unknown',
          req.user.role || 'unknown',
          'UPDATE_PATIENT',
          id,
          { fullName: updateData.full_name || existing.full_name }
        );
      }

      const updated = await db.get<any>('SELECT * FROM patients WHERE id = $1 AND deleted_at IS NULL', [id]);

      // Unified response
      const mappedPatient = mapPatientToResponse(updated, []);
      res.json(mappedPatient);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
);

// DELETE /api/patients/:id - delete patient (soft delete)
router.delete('/:id', async (req: AuthRequest, res) => {
  const { id } = req.params;
  try {
    const existing = await db.get<Patient>('SELECT * FROM patients WHERE id = $1 AND deleted_at IS NULL', [id]);
    if (!existing) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    // Check ownership for community users
    const rawRole = String(req.user?.role || '').trim().toUpperCase();
    const role = rawRole === 'OFFICE' ? 'OFFICER' : rawRole === 'RADIO' ? 'RADIO_CENTER' : rawRole;

    if (role === 'COMMUNITY' && existing.created_by && existing.created_by !== req.user?.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Audit Log (soft delete)
    if (req.user) {
      auditService.log(
        req.user.email || 'unknown',
        req.user.role || 'unknown',
        'SOFT_DELETE_PATIENT',
        id,
        { fullName: existing.full_name }
      );
    }

    // Soft delete patient record (do not remove files to allow restore)
    await db.query('UPDATE patients SET deleted_at = CURRENT_TIMESTAMP WHERE id = $1 AND deleted_at IS NULL', [id]);

    res.status(204).send();
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
