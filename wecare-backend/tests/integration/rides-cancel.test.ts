import request from 'supertest';
import app from '../../src/index';

describe('Ride cancellation flow', () => {
  let authToken: string;
  let createdRideId: string;

  beforeAll(async () => {
    const email = `test_office_${Date.now()}@example.com`;
    const password = 'StrongPassw0rd!';

    await request(app)
      .post('/api/auth/register')
      .send({
        email,
        password,
        role: 'COMMUNITY'
      })
      .expect(201);

    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email, password })
      .expect(200);

    authToken = loginRes.body.token;
  });

  test('creates and cancels a ride using status CANCELLED', async () => {
    const createRes = await request(app)
      .post('/api/rides')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        patient_id: 'PAT-001',
        patient_name: 'Integration Test Patient',
        pickup_location: 'Test Pickup',
        destination: 'Test Destination',
        appointment_time: new Date().toISOString()
      })
      .expect(201);

    createdRideId = createRes.body.id;

    await request(app)
      .put(`/api/rides/${createdRideId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ status: 'CANCELLED' })
      .expect(200);

    const getRes = await request(app)
      .get(`/api/rides/${createdRideId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(getRes.body.status).toBe('CANCELLED');
  });
});
