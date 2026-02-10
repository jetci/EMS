/**
 * Integration Tests for Patients API
 */
import request from 'supertest';
import express from 'express';
import authRoutes from '../../src/routes/auth';
import patientRoutes from '../../src/routes/patients';
import { initializeDatabase, sqliteDB } from '../../src/db/sqliteDB';

// Create test app mounting only necessary routes
const app = express();
app.use(express.json());
app.use('/api', authRoutes); // for /api/auth/login
app.use('/api/patients', patientRoutes); // protected by authenticateToken inside router

// Helper: robust admin login (tries multiple known passwords)
async function loginAdmin(): Promise<string> {
  const credentials = [
    { email: 'admin@wecare.ems', password: 'password123' },
    { email: 'admin@wecare.ems', password: 'Admin@123' },
  ];

  for (const cred of credentials) {
    const res = await request(app)
      .post('/api/auth/login')
      .send(cred);
    if (res.status === 200 && res.body?.token) {
      return res.body.token;
    }
  }
  throw new Error('Admin login failed with all known credentials');
}

describe('Patients API Integration Tests', () => {
  let adminToken: string | null = null;
  let createdPatientId: string | null = null;

  beforeAll(async () => {
    // Ensure database schema and seed data are initialized for tests
    await initializeDatabase();
  });

  afterAll(() => {
    // Ensure database connection is closed to prevent open handles
    try {
      sqliteDB.close();
    } catch (err) {
      // ignore
    }
  });

  describe('POST /api/patients', () => {
    test('should reject invalid payload by Joi (missing fullName)', async () => {
      if (!adminToken) adminToken = await loginAdmin();

      const invalidPayload = {
        // fullName missing
        nationalId: '123', // invalid
      };

      const res = await request(app)
        .post('/api/patients')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(invalidPayload);

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error', 'Validation failed');
      expect(Array.isArray(res.body.details)).toBe(true);
      const fields = res.body.details.map((d: any) => d.field);
      expect(fields).toContain('fullName');
    });

    test('should create a new patient with JSON string fields and return mapped response', async () => {
      if (!adminToken) adminToken = await loginAdmin();

      const payload = {
        fullName: 'ทดสอบ ผู้ป่วย',
        title: 'นาย',
        nationalId: '1234567890123',
        contactPhone: '0812345678',
        patientTypes: JSON.stringify(['ผู้สูงอายุ']),
        chronicDiseases: JSON.stringify(['เบาหวาน']),
        allergies: JSON.stringify(['ยาบางชนิด']),
        currentAddress: JSON.stringify({
          houseNumber: '1',
          village: 'หมู่ 2',
          tambon: 'ในเมือง',
          amphoe: 'เมือง',
          changwat: 'ขอนแก่น',
        }),
        idCardAddress: JSON.stringify({
          houseNumber: '99/1',
          village: 'หมู่ 5',
          tambon: 'สำราญ',
          amphoe: 'เมือง',
          changwat: 'ขอนแก่น',
        }),
        landmark: 'ใกล้วัดใหญ่',
        latitude: '13.123',
        longitude: '100.456',
        emergencyContactName: 'ญาติ',
        emergencyContactPhone: '0891234567',
        emergencyContactRelation: 'บุตร',
      };

      const res = await request(app)
        .post('/api/patients')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(payload);

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body.id).toMatch(/^PAT-\d+$/);
      createdPatientId = res.body.id;

      expect(res.body.fullName).toBe(payload.fullName);
      expect(res.body.title).toBe(payload.title);
      expect(res.body.createdBy).toBeDefined();

      // Registered Address (from idCardAddress)
      expect(res.body).toHaveProperty('registeredAddress');
      expect(res.body.registeredAddress).toMatchObject({
        changwat: 'ขอนแก่น',
      });

      // Patient types should be parsed array
      expect(Array.isArray(res.body.patientTypes)).toBe(true);
      expect(res.body.patientTypes).toContain('ผู้สูงอายุ');
    });
  });

  describe('GET /api/patients', () => {
    test('should return paginated list with mapped patients including the created one', async () => {
      if (!adminToken) adminToken = await loginAdmin();
      const res = await request(app)
        .get('/api/patients')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('data');
      expect(res.body).toHaveProperty('pagination');
      expect(Array.isArray(res.body.data)).toBe(true);

      if (createdPatientId) {
        const found = res.body.data.find((p: any) => p.id === createdPatientId);
        expect(found).toBeDefined();
        expect(found.fullName).toBe('ทดสอบ ผู้ป่วย');
        expect(found).toHaveProperty('registeredAddress');
        expect(found).toHaveProperty('currentAddress');
      }
    });
  });

  describe('PUT /api/patients/:id', () => {
    test('should update patient fields including addresses and emergency contact', async () => {
      if (!adminToken) adminToken = await loginAdmin();
      expect(createdPatientId).toBeTruthy();

      const updatePayload = {
        title: 'นาง',
        emergencyContactName: 'พี่สาว',
        emergencyContactPhone: '0822222222',
        emergencyContactRelation: 'พี่น้อง',
        currentAddress: JSON.stringify({
          houseNumber: '22/7',
          village: 'หมู่ 3',
          tambon: 'ท่าพระ',
          amphoe: 'เมือง',
          changwat: 'ขอนแก่น',
        }),
        idCardAddress: JSON.stringify({
          houseNumber: '100',
          village: 'หมู่ 9',
          tambon: 'บ้านเป็ด',
          amphoe: 'เมือง',
          changwat: 'ขอนแก่น',
        }),
        allergies: JSON.stringify(['ถั่ว']),
      };

      const res = await request(app)
        .put(`/api/patients/${createdPatientId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updatePayload);

      expect(res.status).toBe(200);
      expect(res.body.title).toBe('นาง');
      expect(res.body.emergencyContact).toMatchObject({
        name: 'พี่สาว',
        phone: '0822222222',
        relation: 'พี่น้อง',
      });
      expect(res.body.currentAddress).toMatchObject({
        changwat: 'ขอนแก่น',
      });
      expect(Array.isArray(res.body.allergies)).toBe(true);
      expect(res.body.allergies).toContain('ถั่ว');
    });

    test('should perform partial update without overwriting unspecified fields', async () => {
      if (!adminToken) adminToken = await loginAdmin();
      expect(createdPatientId).toBeTruthy();

      // Fetch current patient to capture existing values
      const before = sqliteDB.get<any>('SELECT * FROM patients WHERE id = ? AND deleted_at IS NULL', [createdPatientId]);
      expect(before).toBeDefined();

      // Perform partial update: only change title
      const partialUpdate = { title: 'น.ส.' };
      const res = await request(app)
        .put(`/api/patients/${createdPatientId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(partialUpdate);

      expect(res.status).toBe(200);
      expect(res.body.title).toBe('น.ส.');

      // Ensure unspecified fields remain unchanged
      expect(res.body.fullName).toBe(before.full_name);
      expect(res.body.emergencyContact).toMatchObject({
        name: before.emergency_contact_name || null,
        phone: before.emergency_contact_phone || null,
        relation: before.emergency_contact_relation || null,
      });

      // Ensure JSON fields remain intact if unspecified
      const after = sqliteDB.get<any>('SELECT * FROM patients WHERE id = ? AND deleted_at IS NULL', [createdPatientId]);
      expect(after.patient_types).toBe(before.patient_types);
      expect(after.allergies).toBe(before.allergies);
    });
  });

  describe('DELETE /api/patients/:id', () => {
    test('should soft delete patient and set deleted_at, and return 204', async () => {
      if (!adminToken) adminToken = await loginAdmin();
      expect(createdPatientId).toBeTruthy();

      const delRes = await request(app)
        .delete(`/api/patients/${createdPatientId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(delRes.status).toBe(204);

      // Verify in DB that patient is soft-deleted (deleted_at is set)
      const dbCheck = sqliteDB.get<any>('SELECT deleted_at FROM patients WHERE id = ?', [createdPatientId]);
      expect(dbCheck).toBeDefined();
      expect(dbCheck.deleted_at).toBeDefined();

      // Verify that listing patients no longer returns the deleted patient
      const listRes = await request(app)
        .get('/api/patients')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(listRes.status).toBe(200);
      const found = listRes.body.data.find((p: any) => p.id === createdPatientId);
      expect(found).toBeUndefined();
    });
  });
});