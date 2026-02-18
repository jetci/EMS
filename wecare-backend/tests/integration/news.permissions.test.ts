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

describe('News permissions and draft visibility', () => {
  beforeAll(async () => {
    process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/wecare_test';
    await initializeSchema();
    await seedData();
  });

  test('OFFICER can create draft and public cannot fetch it by id', async () => {
    const token = await login('officer1@wecare.dev');
    const create = await request(app)
      .post('/api/news')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Draft News', content: 'draft body', status: 'draft', is_published: false });
    expect(create.status).toBe(201);
    const id = create.body?.id;
    expect(id).toBeTruthy();

    const pub = await request(app).get(`/api/news/${id}`);
    expect(pub.status).toBe(404);

    const auth = await request(app)
      .get(`/api/news/${id}`)
      .set('Authorization', `Bearer ${token}`);
    expect(auth.status).toBe(200);
    expect(auth.body).toHaveProperty('status', 'draft');
  });

  test('radio_center can delete news', async () => {
    const token = await login('radio_center@wecare.dev');
    const create = await request(app)
      .post('/api/news')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Temp News', content: 'temp', status: 'draft', is_published: false });
    expect(create.status).toBe(201);
    const id = create.body?.id;

    const del = await request(app)
      .delete(`/api/news/${id}`)
      .set('Authorization', `Bearer ${token}`);
    expect(del.status).toBe(204);
  });
});
