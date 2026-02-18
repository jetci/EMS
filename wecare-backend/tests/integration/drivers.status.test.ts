import request from 'supertest';
import app from '../../src/index';
import { initializeSchema, seedData } from '../../src/db/postgresDB';

async function login(email: string): Promise<string> {
  const res = await request(app)
    .post('/api/auth/login')
    .send({ email, password: 'password123' });
  if (res.status === 200 && res.body?.token) return res.body.token;
  throw new Error(`Login failed for ${email}`);
}

describe('Drivers status update compatibility', () => {
  beforeAll(async () => {
    process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/wecare_test';
    await initializeSchema();
    await seedData();
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
