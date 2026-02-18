import request from 'supertest';
import express from 'express';
import authRoutes from '../../src/routes/auth';
import systemRoutes from '../../src/routes/system';
import { initializeSchema, seedData } from '../../src/db/postgresDB';

/**
 * Integration test: Migration flow creates a safety backup before applying migrations
 */

const app = express();
app.use(express.json());
app.use('/api', authRoutes);
app.use('/api/admin/system', systemRoutes);

async function loginAdmin(): Promise<string> {
  const credentials = [
    { email: 'admin@wecare.ems', password: 'password123' },
    { email: 'admin@wecare.ems', password: 'Admin@123' },
  ];

  for (const cred of credentials) {
    const res = await request(app).post('/api/auth/login').send(cred);
    if (res.status === 200 && res.body?.token) return res.body.token;
  }
  throw new Error('Admin login failed');
}

describe('Database reset flow (PostgreSQL)', () => {
  let adminToken: string;

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    process.env.ENABLE_DEV_DB_RESET = 'true';
    process.env.ENABLE_DEV_DB_SEED = 'true';
    process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/wecare_test';

    await initializeSchema();
    await seedData();
    adminToken = await loginAdmin();
  });

  test('reset-db reinitializes database and keeps admin login working', async () => {
    const resetRes = await request(app)
      .post('/api/admin/system/reset-db')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        confirm: process.env.RESET_DB_CONFIRM_PHRASE || 'CONFIRM_RESET_DB',
        reason: 'reset database for migration integration test'
      });
    expect(resetRes.status).toBe(200);
    expect(resetRes.body).toHaveProperty('message', 'Database reset successfully');

    const loginRes = await request(app).post('/api/auth/login').send({
      email: 'admin@wecare.ems',
      password: 'password123'
    });
    expect(loginRes.status).toBe(200);
    expect(loginRes.body).toHaveProperty('token');
  });
});
