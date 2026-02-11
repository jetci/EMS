import request from 'supertest';
import express from 'express';
import authRoutes from '../../src/routes/auth';
import driverRoutes from '../../src/routes/drivers';
import { initializeDatabase, sqliteDB } from '../../src/db/sqliteDB';

const app = express();
app.use(express.json());
app.use('/api', authRoutes);
app.use('/api/drivers', driverRoutes);

async function login(email: string): Promise<string> {
  const res = await request(app)
    .post('/api/auth/login')
    .send({ email, password: 'password123' });
  if (res.status === 200 && res.body?.token) return res.body.token;
  throw new Error(`Login failed for ${email}`);
}

describe('Drivers status update compatibility', () => {
  beforeAll(async () => {
    await initializeDatabase();
  });

  afterAll(() => {
    try { sqliteDB.close(); } catch { }
  });

  test('OFFICER can set driver status to INACTIVE', async () => {
    const token = await login('officer1@wecare.dev');
    const res = await request(app)
      .put('/api/drivers/DRV-001')
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'INACTIVE' });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status', 'INACTIVE');
  });
});

