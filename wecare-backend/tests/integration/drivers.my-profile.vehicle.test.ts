import request from 'supertest';
import app from '../../src/index';
import { initializeSchema, seedData } from '../../src/db/postgresDB';
import { db } from '../../src/db';

async function login(email: string): Promise<string> {
  const res = await request(app)
    .post('/api/auth/login')
    .send({ email, password: 'password123' });
  if (res.status === 200 && res.body?.token) return res.body.token;
  throw new Error(`Login failed for ${email}`);
}

describe('Driver my-profile vehicle info consistency', () => {
  beforeAll(async () => {
    process.env.DATABASE_URL =
      process.env.DATABASE_URL ||
      'postgres://postgres:postgres@localhost:5432/wecare_test';
    await initializeSchema();
    await seedData();
  });

  test('my-profile returns joined vehicle fields for driver with current_vehicle_id', async () => {
    const token = await login('driver1@wecare.dev');

    const driverRes = await db.get<any>(
      'SELECT * FROM drivers WHERE user_id = (SELECT id FROM users WHERE email = $1)',
      ['driver1@wecare.dev']
    );

    expect(driverRes).toBeTruthy();

    // Ensure driver has a vehicle; if not, attach an existing one
    if (!driverRes.current_vehicle_id) {
      const anyVehicle = await db.get<any>('SELECT id FROM vehicles LIMIT 1');
      if (anyVehicle?.id) {
        await db.update('drivers', driverRes.id, {
          current_vehicle_id: anyVehicle.id,
        });
      }
    }

    const profileRes = await request(app)
      .get('/api/drivers/my-profile')
      .set('Authorization', `Bearer ${token}`);

    expect(profileRes.status).toBe(200);
    expect(profileRes.body).toHaveProperty('id');
    expect(profileRes.body).toHaveProperty('license_plate');
    expect(profileRes.body).toHaveProperty('brand');
    expect(profileRes.body).toHaveProperty('model');
    expect(profileRes.body).toHaveProperty('color');
  });
});
