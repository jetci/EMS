import request from 'supertest';
import express from 'express';
import authRoutes from '../../src/routes/auth';
import usersRoutes from '../../src/routes/users';
import driverRoutes from '../../src/routes/drivers';
import { initializeDatabase, sqliteDB } from '../../src/db/sqliteDB';

const app = express();
app.use(express.json());
app.use('/api', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/drivers', driverRoutes);

async function loginOfficer(): Promise<string> {
  const res = await request(app)
    .post('/api/auth/login')
    .send({ email: 'officer1@wecare.dev', password: 'password123' });
  if (res.status === 200 && res.body?.token) return res.body.token;
  throw new Error('Officer login failed');
}

describe('Drivers create (OFFICER)', () => {
  beforeAll(async () => {
    await initializeDatabase();
  });

  afterAll(() => {
    try { sqliteDB.close(); } catch { }
  });

  test('OFFICER can create driver from candidate user', async () => {
    const token = await loginOfficer();

    const userId = 'USR-TST-DRV-CAND';
    sqliteDB.insert('users', {
      id: userId,
      email: 'drv_candidate@wecare.test',
      password: 'x',
      role: 'community',
      full_name: 'Driver Candidate',
      date_created: new Date().toISOString(),
      status: 'Active',
      phone: '0800000000',
      profile_image_url: null,
    });

    const res = await request(app)
      .post('/api/drivers')
      .set('Authorization', `Bearer ${token}`)
      .send({
        user_id: userId,
        full_name: 'Driver Candidate',
        phone: '0800000000',
        status: 'AVAILABLE',
        license_plate: 'กข-9999',
        brand: 'Toyota',
        model: 'Commuter',
        color: 'ขาว',
      });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
  });
});

