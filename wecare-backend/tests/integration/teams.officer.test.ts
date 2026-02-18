import request from 'supertest';
import express from 'express';
import authRoutes from '../../src/routes/auth';
import teamsRoutes from '../../src/routes/teams';
import { initializeSchema, seedData } from '../../src/db/postgresDB';

const app = express();
app.use(express.json());
app.use('/api', authRoutes);
app.use('/api/teams', teamsRoutes);

async function loginOfficer(): Promise<string> {
  const res = await request(app)
    .post('/api/auth/login')
    .send({ email: 'officer1@wecare.dev', password: 'password123' });

  if (res.status === 200 && res.body?.token) return res.body.token;
  throw new Error('Officer login failed');
}

describe('Teams API (OFFICER permissions)', () => {
  beforeAll(async () => {
    process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/wecare_test';
    await initializeSchema();
    await seedData();
  });

  afterAll(() => {
  });

  test('OFFICER can create a team', async () => {
    const token = await loginOfficer();
    const teamName = `ทีมทดสอบ OFFICER ${Date.now()}`;
    const res = await request(app)
      .post('/api/teams')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: teamName,
        leader_id: 'DRV-001',
        member_ids: ['USR-001'],
        status: 'Active',
      });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body).toHaveProperty('name', teamName);
  });

  test('OFFICER can delete a team', async () => {
    const token = await loginOfficer();
    const teamName = `ทีมทดสอบ OFFICER ลบ ${Date.now()}`;
    const create = await request(app)
      .post('/api/teams')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: teamName,
        leader_id: 'DRV-001',
        member_ids: ['USR-001'],
        status: 'Active',
      });

    expect(create.status).toBe(201);
    const id = create.body?.id;
    expect(id).toBeTruthy();

    const del = await request(app)
      .delete(`/api/teams/${id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(del.status).toBe(204);
  });
});
