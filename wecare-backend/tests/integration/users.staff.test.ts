import request from 'supertest';
import { initializeDatabase, sqliteDB } from '../../src/db/sqliteDB';
import app from '../../src/index';

async function login(email: string): Promise<string> {
  const passwords = ['password123', 'Admin@123', 'TestPassword123!'];
  for (const password of passwords) {
    const res = await request(app).post('/api/auth/login').send({ email, password });
    if (res.status === 200 && res.body?.token) return res.body.token;
  }
  throw new Error(`Login failed for ${email}`);
}

describe('Users staff endpoint', () => {
  beforeAll(async () => {
    await initializeDatabase();
  });

  afterAll(() => {
    try { sqliteDB.close(); } catch { }
  });

  test('OFFICER can list staff', async () => {
    const token = await login('officer1@wecare.dev');
    const res = await request(app)
      .get('/api/users/staff')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0]).toHaveProperty('id');
    expect(res.body[0]).toHaveProperty('full_name');
    expect(res.body[0]).not.toHaveProperty('password');
  });

  test('RADIO_CENTER can list staff', async () => {
    const token = await login('radio_center@wecare.dev');
    const res = await request(app)
      .get('/api/users/staff')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('OFFICER can list driver candidates', async () => {
    const token = await login('officer1@wecare.dev');
    const res = await request(app)
      .get('/api/users/driver-candidates')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});
