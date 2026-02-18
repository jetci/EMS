/**
 * Patient Service with Data Encryption
 * Handles patient CRUD operations with encryption for sensitive data
 */

import { db } from '../db';
import { encrypt, decrypt, encryptArray, decryptArray } from '../utils/encryption';

export interface PatientData {
  // Personal Info
  fullName: string;
  nationalId?: string;
  dob?: string;
  age?: number;
  gender?: string;
  bloodType?: string;
  rhFactor?: string;
  healthCoverage?: string;
  contactPhone?: string;

  // Address
  idCardAddress?: {
    houseNumber?: string;
    village?: string;
    tambon?: string;
    amphoe?: string;
    changwat?: string;
  };
  currentAddress?: {
    houseNumber?: string;
    village?: string;
    tambon?: string;
    amphoe?: string;
    changwat?: string;
  };

  // Location
  landmark?: string;
  latitude?: string;
  longitude?: string;

  // Emergency Contact
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelation?: string;

  // Medical Info
  patientTypes?: string[];
  chronicDiseases?: string[];
  allergies?: string[];

  // Metadata
  profileImageUrl?: string;
  createdBy?: string;
}

/**
 * Encrypt sensitive patient data before storing in database
 */
export const encryptPatientData = (data: PatientData): any => {
  const encrypted: any = {
    full_name: data.fullName,
    dob: data.dob || null,
    age: data.age || null,
    gender: data.gender || null,
    blood_type: data.bloodType || null,
    rh_factor: data.rhFactor || null,
    health_coverage: data.healthCoverage || null,

    // Address (not encrypted - not considered highly sensitive)
    id_card_house_number: data.idCardAddress?.houseNumber || null,
    id_card_village: data.idCardAddress?.village || null,
    id_card_tambon: data.idCardAddress?.tambon || null,
    id_card_amphoe: data.idCardAddress?.amphoe || null,
    id_card_changwat: data.idCardAddress?.changwat || null,

    current_house_number: data.currentAddress?.houseNumber || null,
    current_village: data.currentAddress?.village || null,
    current_tambon: data.currentAddress?.tambon || null,
    current_amphoe: data.currentAddress?.amphoe || null,
    current_changwat: data.currentAddress?.changwat || null,

    // Location
    landmark: data.landmark || null,
    latitude: data.latitude || null,
    longitude: data.longitude || null,

    // Emergency Contact (phone encrypted)
    emergency_contact_name: data.emergencyContactName || null,
    emergency_contact_relation: data.emergencyContactRelation || null,

    // Metadata
    profile_image_url: data.profileImageUrl || null,
    registered_date: new Date().toISOString().split('T')[0],
    created_by: data.createdBy || null,
  };

  // 🔐 ENCRYPT SENSITIVE DATA
  try {
    // National ID (เลขบัตรประชาชน)
    if (data.nationalId) {
      encrypted.national_id = encrypt(data.nationalId);
    }

    // Contact Phone (เบอร์โทรศัพท์)
    if (data.contactPhone) {
      encrypted.contact_phone = encrypt(data.contactPhone);
    }

    // Emergency Contact Phone
    if (data.emergencyContactPhone) {
      encrypted.emergency_contact_phone = encrypt(data.emergencyContactPhone);
    }

    // Medical Data (โรคประจำตัว, แพ้ยา)
    encrypted.patient_types = encryptArray(data.patientTypes || []);
    encrypted.chronic_diseases = encryptArray(data.chronicDiseases || []);
    encrypted.allergies = encryptArray(data.allergies || []);

  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt patient data');
  }

  return encrypted;
};

/**
 * Decrypt sensitive patient data after retrieving from database
 */
export const decryptPatientData = (dbPatient: any): any => {
  if (!dbPatient) return null;

  const decrypted: any = {
    id: dbPatient.id,
    fullName: dbPatient.full_name,
    dob: dbPatient.dob,
    age: dbPatient.age,
    gender: dbPatient.gender,
    bloodType: dbPatient.blood_type,
    rhFactor: dbPatient.rh_factor,
    healthCoverage: dbPatient.health_coverage,

    // Address
    registeredAddress: {
      houseNumber: dbPatient.id_card_house_number,
      village: dbPatient.id_card_village,
      tambon: dbPatient.id_card_tambon,
      amphoe: dbPatient.id_card_amphoe,
      changwat: dbPatient.id_card_changwat,
    },
    currentAddress: {
      houseNumber: dbPatient.current_house_number,
      village: dbPatient.current_village,
      tambon: dbPatient.current_tambon,
      amphoe: dbPatient.current_amphoe,
      changwat: dbPatient.current_changwat,
    },

    // Location
    landmark: dbPatient.landmark,
    latitude: dbPatient.latitude,
    longitude: dbPatient.longitude,

    // Emergency Contact
    emergencyContact: {
      name: dbPatient.emergency_contact_name,
      relation: dbPatient.emergency_contact_relation,
    },

    // Metadata
    profileImageUrl: dbPatient.profile_image_url,
    registeredDate: dbPatient.registered_date,
    createdBy: dbPatient.created_by,
    createdAt: dbPatient.created_at,
    updatedAt: dbPatient.updated_at,
  };

  // 🔓 DECRYPT SENSITIVE DATA
  try {
    // National ID
    if (dbPatient.national_id) {
      decrypted.nationalId = decrypt(dbPatient.national_id);
    }

    // Contact Phone
    if (dbPatient.contact_phone) {
      decrypted.contactPhone = decrypt(dbPatient.contact_phone);
    }

    // Emergency Contact Phone
    if (dbPatient.emergency_contact_phone) {
      decrypted.emergencyContact.phone = decrypt(dbPatient.emergency_contact_phone);
    }

    // Medical Data
    decrypted.patientTypes = decryptArray(dbPatient.patient_types || '');
    decrypted.chronicDiseases = decryptArray(dbPatient.chronic_diseases || '');
    decrypted.allergies = decryptArray(dbPatient.allergies || '');

  } catch (error) {
    console.error('Decryption error for patient:', dbPatient.id, error);
    // Return partial data if decryption fails (better than nothing)
    decrypted.nationalId = '[DECRYPTION ERROR]';
    decrypted.contactPhone = '[DECRYPTION ERROR]';
    decrypted.patientTypes = [];
    decrypted.chronicDiseases = [];
    decrypted.allergies = [];
  }

  return decrypted;
};

/**
 * Generate next patient ID
 */
export const generatePatientId = async (): Promise<string> => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  const uniqueNumber = `${timestamp}${String(random).padStart(3, '0')}`;
  return `PAT-${uniqueNumber}`;
};

/**
 * Create new patient with encrypted data
 */
export const createPatient = async (data: PatientData): Promise<any> => {
  const id = await generatePatientId();
  const encryptedData = encryptPatientData(data);

  const patientRecord: any = {
    id,
    ...encryptedData,
  };

  if (patientRecord.patient_types !== undefined) {
    patientRecord.patient_types = JSON.stringify(patientRecord.patient_types);
  }
  if (patientRecord.chronic_diseases !== undefined) {
    patientRecord.chronic_diseases = JSON.stringify(patientRecord.chronic_diseases);
  }
  if (patientRecord.allergies !== undefined) {
    patientRecord.allergies = JSON.stringify(patientRecord.allergies);
  }

  await db.insert('patients', patientRecord);

  // Return decrypted data for response
  const created = await db.get<any>('SELECT * FROM patients WHERE id = $1 AND deleted_at IS NULL', [id]);
  return decryptPatientData(created);
};

/**
 * Get patient by ID with decrypted data
 */
export const getPatientById = async (id: string): Promise<any> => {
  const patient = await db.get<any>('SELECT * FROM patients WHERE id = $1 AND deleted_at IS NULL', [id]);
  return decryptPatientData(patient);
};

/**
 * Get all patients with decrypted data
 */
export const getAllPatients = async (filters: {
  createdBy?: string;
  page?: number;
  limit?: number;
}): Promise<{ data: any[]; total: number }> => {
  const { createdBy, page = 1, limit = 20 } = filters;
  const offset = (page - 1) * limit;

  let whereClause = 'WHERE deleted_at IS NULL';
  const params: any[] = [];

  if (createdBy) {
    whereClause += ' AND created_by = $1';
    params.push(createdBy);
  }

  // Get total count
  const countSql = `SELECT COUNT(*) as count FROM patients ${whereClause}`;
  const countResult = await db.get<{ count: number }>(countSql, params);
  const total = parseInt(String(countResult?.count || 0));

  // Get paginated data
  const dataSql = `SELECT * FROM patients ${whereClause} ORDER BY registered_date DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
  const patients = await db.all<any>(dataSql, [...params, limit, offset]);

  // Decrypt all patients
  const decryptedPatients = patients.map(p => decryptPatientData(p));

  return {
    data: decryptedPatients,
    total,
  };
};

/**
 * Update patient with encrypted data
 */
export const updatePatient = async (id: string, data: Partial<PatientData>): Promise<any> => {
  const existing = await db.get<any>('SELECT * FROM patients WHERE id = $1 AND deleted_at IS NULL', [id]);
  if (!existing) {
    throw new Error('Patient not found');
  }

  const updateData: any = {};

  // Non-sensitive fields (direct update)
  if (data.fullName) updateData.full_name = data.fullName;
  if (data.dob) updateData.dob = data.dob;
  if (data.age) updateData.age = data.age;
  if (data.gender) updateData.gender = data.gender;
  if (data.bloodType) updateData.blood_type = data.bloodType;
  if (data.rhFactor) updateData.rh_factor = data.rhFactor;
  if (data.healthCoverage) updateData.health_coverage = data.healthCoverage;

  // Address
  if (data.idCardAddress) {
    if (data.idCardAddress.houseNumber) updateData.id_card_house_number = data.idCardAddress.houseNumber;
    if (data.idCardAddress.village) updateData.id_card_village = data.idCardAddress.village;
    if (data.idCardAddress.tambon) updateData.id_card_tambon = data.idCardAddress.tambon;
    if (data.idCardAddress.amphoe) updateData.id_card_amphoe = data.idCardAddress.amphoe;
    if (data.idCardAddress.changwat) updateData.id_card_changwat = data.idCardAddress.changwat;
  }

  if (data.currentAddress) {
    if (data.currentAddress.houseNumber) updateData.current_house_number = data.currentAddress.houseNumber;
    if (data.currentAddress.village) updateData.current_village = data.currentAddress.village;
    if (data.currentAddress.tambon) updateData.current_tambon = data.currentAddress.tambon;
    if (data.currentAddress.amphoe) updateData.current_amphoe = data.currentAddress.amphoe;
    if (data.currentAddress.changwat) updateData.current_changwat = data.currentAddress.changwat;
  }

  // Location
  if (data.landmark) updateData.landmark = data.landmark;
  if (data.latitude) updateData.latitude = data.latitude;
  if (data.longitude) updateData.longitude = data.longitude;

  // Emergency Contact
  if (data.emergencyContactName) updateData.emergency_contact_name = data.emergencyContactName;
  if (data.emergencyContactRelation) updateData.emergency_contact_relation = data.emergencyContactRelation;

  // 🔐 ENCRYPT SENSITIVE FIELDS
  try {
    if (data.nationalId) {
      updateData.national_id = encrypt(data.nationalId);
    }

    if (data.contactPhone) {
      updateData.contact_phone = encrypt(data.contactPhone);
    }

    if (data.emergencyContactPhone) {
      updateData.emergency_contact_phone = encrypt(data.emergencyContactPhone);
    }

    if (data.patientTypes) {
      updateData.patient_types = JSON.stringify(encryptArray(data.patientTypes));
    }

    if (data.chronicDiseases) {
      updateData.chronic_diseases = JSON.stringify(encryptArray(data.chronicDiseases));
    }

    if (data.allergies) {
      updateData.allergies = JSON.stringify(encryptArray(data.allergies));
    }
  } catch (error) {
    console.error('Encryption error during update:', error);
    throw new Error('Failed to encrypt patient data');
  }

  await db.update('patients', id, updateData);

  // Return decrypted data
  const updated = await db.get<any>('SELECT * FROM patients WHERE id = $1 AND deleted_at IS NULL', [id]);
  return decryptPatientData(updated);
};

/**
 * Delete patient
 */
export const deletePatient = async (id: string): Promise<void> => {
  const existing = await db.get<any>('SELECT * FROM patients WHERE id = $1 AND deleted_at IS NULL', [id]);
  if (!existing) {
    throw new Error('Patient not found');
  }

  await db.query('UPDATE patients SET deleted_at = NOW() WHERE id = $1 AND deleted_at IS NULL', [id]);
};

/**
 * Search patients by name (decrypted results)
 * Note: Searching encrypted fields (national_id, phone) is not possible
 * without decrypting all records. Consider using tokenization for searchable encryption.
 */
export const searchPatientsByName = async (query: string, createdBy?: string): Promise<any[]> => {
  let sql = 'SELECT * FROM patients WHERE full_name ILIKE $1 AND deleted_at IS NULL';
  const params: any[] = [`%${query}%`];

  if (createdBy) {
    sql += ' AND created_by = $2';
    params.push(createdBy);
  }

  sql += ' ORDER BY registered_date DESC LIMIT 50';

  const patients = await db.all<any>(sql, params);
  return patients.map(p => decryptPatientData(p));
};
