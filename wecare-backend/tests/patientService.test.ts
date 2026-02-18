/**
 * Patient Service Integration Tests
 * Tests encryption/decryption of patient data
 */

import {
  createPatient,
  getPatientById,
  getAllPatients,
  updatePatient,
  deletePatient,
  encryptPatientData,
  decryptPatientData,
  PatientData
} from '../src/services/patientService';
import { db } from '../src/db';
import { isEncrypted } from '../src/utils/encryption';

// Set test encryption key
process.env.ENCRYPTION_KEY = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';

describe('Patient Service - Encryption Integration', () => {
  beforeAll(async () => {
    const userIds = [
      'USR-001',
      'USR-TEST-001',
      'USR-TEST-002',
      'USR-TEST-003',
      'USR-TEST-004',
      'USR-TEST-005',
      'USR-TEST-006'
    ];
    for (const id of userIds) {
      try {
        await db.run(
          "INSERT INTO users (id, email, password, role, full_name, date_created, status) VALUES ($1, $2, $3, $4, $5, NOW(), 'Active') ON CONFLICT (id) DO NOTHING",
          [id, `${id.toLowerCase()}@wecare.ems`, 'password123', 'community', `Test User ${id}`]
        );
      } catch (e) {
      }
    }
  });

  afterEach(async () => {
    try {
      await db.run('DELETE FROM patients WHERE id LIKE $1', ['PAT-%']);
    } catch (e) {
    }
  });

  describe('encryptPatientData()', () => {
    test('should encrypt sensitive fields', () => {
      const patientData: PatientData = {
        fullName: 'ทดสอบ เข้ารหัส',
        nationalId: '1234567890123',
        contactPhone: '0812345678',
        dob: '1950-01-01',
        age: 74,
        gender: 'ชาย',
        chronicDiseases: ['เบาหวาน', 'ความดันโลหิตสูง'],
        allergies: ['ยาปฏิชีวนะ'],
        createdBy: 'USR-001'
      };

      const encrypted = encryptPatientData(patientData);

      // Sensitive fields should be encrypted
      expect(encrypted.national_id).toBeDefined();
      expect(encrypted.national_id).not.toBe('1234567890123');
      expect(isEncrypted(encrypted.national_id)).toBe(true);

      expect(encrypted.contact_phone).toBeDefined();
      expect(encrypted.contact_phone).not.toBe('0812345678');
      expect(isEncrypted(encrypted.contact_phone)).toBe(true);

      expect(encrypted.chronic_diseases).toBeDefined();
      expect(isEncrypted(encrypted.chronic_diseases)).toBe(true);

      expect(encrypted.allergies).toBeDefined();
      expect(isEncrypted(encrypted.allergies)).toBe(true);

      // Non-sensitive fields should not be encrypted
      expect(encrypted.full_name).toBe('ทดสอบ เข้ารหัส');
      expect(encrypted.dob).toBe('1950-01-01');
      expect(encrypted.age).toBe(74);
      expect(encrypted.gender).toBe('ชาย');
    });

    test('should handle missing optional fields', () => {
      const patientData: PatientData = {
        fullName: 'Test Patient',
        createdBy: 'USR-001'
      };

      const encrypted = encryptPatientData(patientData);

      expect(encrypted.full_name).toBe('Test Patient');
      expect(encrypted.national_id).toBeUndefined();
      expect(encrypted.contact_phone).toBeUndefined();
    });
  });

  describe('decryptPatientData()', () => {
    test('should decrypt encrypted patient data', () => {
      const patientData: PatientData = {
        fullName: 'ทดสอบ ถอดรหัส',
        nationalId: '9876543210987',
        contactPhone: '0898765432',
        chronicDiseases: ['หัวใจ'],
        allergies: ['อาหารทะเล'],
        createdBy: 'USR-001'
      };

      const encrypted = encryptPatientData(patientData);
      const dbPatient = {
        id: 'PAT-001',
        ...encrypted,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const decrypted = decryptPatientData(dbPatient);

      expect(decrypted.nationalId).toBe('9876543210987');
      expect(decrypted.contactPhone).toBe('0898765432');
      expect(decrypted.chronicDiseases).toEqual(['หัวใจ']);
      expect(decrypted.allergies).toEqual(['อาหารทะเล']);
      expect(decrypted.fullName).toBe('ทดสอบ ถอดรหัส');
    });

    test('should handle decryption errors gracefully', () => {
      const dbPatient = {
        id: 'PAT-001',
        full_name: 'Test',
        national_id: 'invalid:encrypted:data',
        contact_phone: 'also:invalid',
        chronic_diseases: 'bad:data',
        allergies: 'bad:data'
      };

      const decrypted = decryptPatientData(dbPatient);

      // Should not throw, but return error indicators
      expect(decrypted.nationalId).toBe('[DECRYPTION ERROR]');
      expect(decrypted.contactPhone).toBe('[DECRYPTION ERROR]');
      expect(decrypted.chronicDiseases).toEqual([]);
      expect(decrypted.allergies).toEqual([]);
    });
  });

  describe('createPatient()', () => {
    test('should create patient with encrypted data', async () => {
      const patientData: PatientData = {
        fullName: 'สมชาย ทดสอบ',
        nationalId: '1111111111111',
        contactPhone: '0811111111',
        dob: '1960-05-15',
        age: 64,
        gender: 'ชาย',
        bloodType: 'O',
        rhFactor: '+',
        patientTypes: ['ผู้สูงอายุ'],
        chronicDiseases: ['เบาหวาน'],
        allergies: [],
        createdBy: 'USR-TEST-001'
      };

      const created = await createPatient(patientData);

      expect(created.id).toBeDefined();
      expect(created.id).toMatch(/^PAT-\d+$/);
      expect(created.fullName).toBe('สมชาย ทดสอบ');
      expect(created.nationalId).toBe('1111111111111'); // Decrypted in response
      expect(created.contactPhone).toBe('0811111111');

      // Verify data is encrypted in database
      const dbPatient = await db.get<any>(
        'SELECT * FROM patients WHERE id = $1',
        [created.id]
      );

      expect(dbPatient.national_id).not.toBe('1111111111111');
      expect(isEncrypted(dbPatient.national_id)).toBe(true);
      expect(dbPatient.contact_phone).not.toBe('0811111111');
      expect(isEncrypted(dbPatient.contact_phone)).toBe(true);
    });
  });

  describe('getPatientById()', () => {
    test('should return decrypted patient data', async () => {
      // Create patient first
      const patientData: PatientData = {
        fullName: 'สมหญิง ทดสอบ',
        nationalId: '2222222222222',
        contactPhone: '0822222222',
        chronicDiseases: ['ความดันโลหิตสูง'],
        createdBy: 'USR-TEST-002'
      };

      const created = await createPatient(patientData);

      // Get patient
      const retrieved = await getPatientById(created.id);

      expect(retrieved).toBeDefined();
      expect(retrieved.nationalId).toBe('2222222222222');
      expect(retrieved.contactPhone).toBe('0822222222');
      expect(retrieved.chronicDiseases).toEqual(['ความดันโลหิตสูง']);
    });

    test('should return null for non-existent patient', async () => {
      const retrieved = await getPatientById('PAT-NONEXISTENT');
      expect(retrieved).toBeNull();
    });
  });

  describe('getAllPatients()', () => {
    test('should return all patients with decrypted data', async () => {
      // Create multiple patients
      await createPatient({
        fullName: 'Patient 1',
        nationalId: '3333333333333',
        contactPhone: '0833333333',
        createdBy: 'USR-TEST-003'
      });

      await createPatient({
        fullName: 'Patient 2',
        nationalId: '4444444444444',
        contactPhone: '0844444444',
        createdBy: 'USR-TEST-003'
      });

      const result = await getAllPatients({
        createdBy: 'USR-TEST-003',
        page: 1,
        limit: 10
      });

      expect(result.data.length).toBeGreaterThanOrEqual(2);
      expect(result.total).toBeGreaterThanOrEqual(2);

      // Check decryption
      const patient1 = result.data.find(p => p.fullName === 'Patient 1');
      expect(patient1.nationalId).toBe('3333333333333');
      expect(patient1.contactPhone).toBe('0833333333');
    });
  });

  describe('updatePatient()', () => {
    test('should update patient with encrypted data', async () => {
      // Create patient
      const created = await createPatient({
        fullName: 'Original Name',
        nationalId: '5555555555555',
        contactPhone: '0855555555',
        createdBy: 'USR-TEST-004'
      });

      // Update patient
      const updated = await updatePatient(created.id, {
        fullName: 'Updated Name',
        nationalId: '6666666666666',
        contactPhone: '0866666666',
        chronicDiseases: ['โรคใหม่']
      });

      expect(updated.fullName).toBe('Updated Name');
      expect(updated.nationalId).toBe('6666666666666');
      expect(updated.contactPhone).toBe('0866666666');
      expect(updated.chronicDiseases).toEqual(['โรคใหม่']);

      // Verify encryption in database
      const dbPatient = await db.get<any>(
        'SELECT * FROM patients WHERE id = $1',
        [created.id]
      );

      expect(dbPatient.national_id).not.toBe('6666666666666');
      expect(isEncrypted(dbPatient.national_id)).toBe(true);
    });

    test('should throw error for non-existent patient', async () => {
      await expect(updatePatient('PAT-NONEXISTENT', { fullName: 'Test' }))
        .rejects
        .toThrow('Patient not found');
    });
  });

  describe('deletePatient()', () => {
    test('should delete patient', async () => {
      const created = await createPatient({
        fullName: 'To Be Deleted',
        nationalId: '7777777777777',
        createdBy: 'USR-TEST-005'
      });

      await deletePatient(created.id);

      const retrieved = await getPatientById(created.id);
      expect(retrieved).toBeNull();
    });

    test('should throw error for non-existent patient', async () => {
      await expect(deletePatient('PAT-NONEXISTENT'))
        .rejects
        .toThrow('Patient not found');
    });
  });

  describe('Data Security', () => {
    test('encrypted data should be different each time', () => {
      const data1 = encryptPatientData({
        fullName: 'Test',
        nationalId: '8888888888888',
        createdBy: 'USR-001'
      });

      const data2 = encryptPatientData({
        fullName: 'Test',
        nationalId: '8888888888888',
        createdBy: 'USR-001'
      });

      // Same input should produce different encrypted output (random IV)
      expect(data1.national_id).not.toBe(data2.national_id);
    });

    test('should not expose sensitive data in database', async () => {
      const created = await createPatient({
        fullName: 'Security Test',
        nationalId: '9999999999999',
        contactPhone: '0899999999',
        chronicDiseases: ['ลับมาก'],
        allergies: ['ข้อมูลลับ'],
        createdBy: 'USR-TEST-006'
      });

      // Query database directly
      const dbPatient = await db.get<any>(
        'SELECT * FROM patients WHERE id = $1',
        [created.id]
      );

      // Verify sensitive data is NOT in plain text
      const dbString = JSON.stringify(dbPatient);
      expect(dbString).not.toContain('9999999999999');
      expect(dbString).not.toContain('0899999999');
      expect(dbString).not.toContain('ลับมาก');
      expect(dbString).not.toContain('ข้อมูลลับ');
    });
  });
});
