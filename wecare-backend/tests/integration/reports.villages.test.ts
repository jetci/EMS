import request from 'supertest';
import express from 'express';
import authRoutes from '../../src/routes/auth';
import reportsRoutes from '../../src/routes/reports';
import { initializeSchema, seedData } from '../../src/db/postgresDB';
import { db } from '../../src/db';
import { authenticateToken, requireRole } from '../../src/middleware/auth';

const app = express();
app.use(express.json());
app.use('/api', authRoutes);
app.use(
  '/api/office/reports',
  authenticateToken,
  requireRole(['admin', 'DEVELOPER', 'OFFICER', 'radio_center']),
  reportsRoutes
);

async function loginOfficer(): Promise<string> {
  const res = await request(app)
    .post('/api/auth/login')
    .send({ email: 'officer1@wecare.dev', password: 'password123' });
  if (res.status === 200 && res.body?.token) return res.body.token;
  throw new Error('Officer login failed');
}

describe('Office reports villages filter', () => {
  beforeAll(async () => {
    process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/wecare_test';
    await initializeSchema();
    await seedData();
  });

  afterAll(async () => {
  });

  test('accepts JSON villages list with commas in value', async () => {
    const patientId = `PAT-VLG-${Date.now()}`;
    await db.insert('patients', {
      id: patientId,
      full_name: 'ผู้ป่วย A',
      registered_date: '2026-02-01T00:00:00',
      current_village: 'หมู่ 3 เต๋าดิน, เวียงสุทโธ',
      id_card_village: '',
    });

    const token = await loginOfficer();
    const res = await request(app)
      .get('/api/office/reports/patients')
      .set('Authorization', `Bearer ${token}`)
      .query({
        startDate: '2026-02-01',
        endDate: '2026-02-02',
        villages: JSON.stringify(['หมู่ 3 เต๋าดิน, เวียงสุทโธ']),
      });

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.some((p: any) => p.id === patientId)).toBe(true);
  });
});
