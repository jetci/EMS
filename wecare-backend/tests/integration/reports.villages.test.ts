import request from 'supertest';
import express from 'express';
import authRoutes from '../../src/routes/auth';
import reportsRoutes from '../../src/routes/reports';
import { initializeDatabase, sqliteDB } from '../../src/db/sqliteDB';
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
    await initializeDatabase();
  });

  afterAll(() => {
    try { sqliteDB.close(); } catch { }
  });

  test('accepts JSON villages list with commas in value', async () => {
    sqliteDB.insert('patients', {
      id: 'PAT-VLG-001',
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
    expect(res.body.some((p: any) => p.id === 'PAT-VLG-001')).toBe(true);
  });
});
