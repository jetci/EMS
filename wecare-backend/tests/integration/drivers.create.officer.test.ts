import request from 'supertest';
import express from 'express';
import authRoutes from '../../src/routes/auth';
import usersRoutes from '../../src/routes/users';
import driverRoutes from '../../src/routes/drivers';
import { initializeSchema, seedData } from '../../src/db/postgresDB';
import { db } from '../../src/db';

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
    process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/wecare_test';
    await initializeSchema();
    await seedData();
  });

  afterAll(async () => {
  });

  test('OFFICER can create driver from candidate user', async () => {
    const token = await loginOfficer();

    const userId = `USR-TST-DRV-CAND-${Date.now()}`;
    await db.insert('users', {
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

  test('should reject driver creation when user_id does not exist', async () => {
    const token = await loginOfficer();

    const res = await request(app)
      .post('/api/drivers')
      .set('Authorization', `Bearer ${token}`)
      .send({
        user_id: 'USR-NOT-EXIST',
        full_name: 'Ghost User',
        phone: '0800000001',
        status: 'AVAILABLE',
        license_plate: 'ทด-0001',
        brand: 'Toyota',
        model: 'Commuter',
        color: 'ขาว',
      });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error', 'User not found');
  });

  test('should reject driver creation for ADMIN or DEVELOPER user', async () => {
    const token = await loginOfficer();

    const adminUserId = `USR-TST-ADMIN-DRV-${Date.now()}`;
    await db.insert('users', {
      id: adminUserId,
      email: 'admin_driver@wecare.test',
      password: 'x',
      role: 'admin',
      full_name: 'Admin As Driver',
      date_created: new Date().toISOString(),
      status: 'Active',
      phone: '0800000002',
      profile_image_url: null,
    });

    const res = await request(app)
      .post('/api/drivers')
      .set('Authorization', `Bearer ${token}`)
      .send({
        user_id: adminUserId,
        full_name: 'Admin As Driver',
        phone: '0800000002',
        status: 'AVAILABLE',
        license_plate: 'ทด-0002',
        brand: 'Toyota',
        model: 'Commuter',
        color: 'ขาว',
      });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error', 'Invalid user role for driver');
  });
});
