/**
 * Integration Tests for Settings API
 */
import request from 'supertest';
import app from '../../src/index';

// Helper: robust admin login (tries multiple known passwords)
async function loginAdmin(): Promise<string> {
  const credentials = [
    { email: 'admin@wecare.ems', password: 'password123' },
    { email: 'admin@wecare.ems', password: 'Admin@123' },
  ];

  for (const cred of credentials) {
    const res = await request(app)
      .post('/api/auth/login')
      .send(cred);
    if (res.status === 200 && res.body?.token) {
      return res.body.token;
    }
  }
  throw new Error('Admin login failed with all known credentials');
}

describe('Settings API Integration Tests', () => {
  let adminToken: string | null = null;

  beforeAll(async () => {
    // No special DB initialization needed; global setup should handle schema/seed
  });

  afterAll(() => {
    // No explicit DB cleanup required for Postgres-based tests
  });

  describe('GET /api/settings/public', () => {
    test('should return public settings without authentication and not 500', async () => {
      const res = await request(app).get('/api/settings/public');
      expect([200, 304]).toContain(res.status); // allow 200 OK or caching status, but mainly ensure not 500
      expect(res.body).toHaveProperty('appName');
      expect(res.body).toHaveProperty('organizationName');
      expect(typeof res.body.appName).toBe('string');
      expect(typeof res.body.organizationName).toBe('string');
    });
  });

  describe('GET /api/settings (protected)', () => {
    test('should require authentication (401 or 403)', async () => {
      const res = await request(app).get('/api/settings');
      expect([401, 403]).toContain(res.status);
    });

    test('should allow access after admin login and return settings', async () => {
      // Login using seeded admin credentials (robust)
      adminToken = await loginAdmin();

      const res = await request(app)
        .get('/api/settings')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('appName');
      expect(typeof res.body.appName).toBe('string');
    });
  });

  describe('PUT /api/settings (update settings)', () => {
    beforeAll(async () => {
      if (!adminToken) {
        adminToken = await loginAdmin();
      }
    });

    test('should update settings and reflect changes with correct types', async () => {
      const newSettings = {
        appName: 'EMS WeCare Test',
        organizationName: 'WeCare Unit Test Org',
        maintenanceMode: true,
        mapCenterLat: 13.773,
        mapCenterLng: 100.544,
      };

      const putRes = await request(app)
        .put('/api/settings')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(newSettings);

      expect(putRes.status).toBe(200);
      expect(putRes.body.appName).toBe(newSettings.appName);

      const getRes = await request(app)
        .get('/api/settings')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(getRes.status).toBe(200);
      expect(getRes.body.appName).toBe(newSettings.appName);
      expect(getRes.body.organizationName).toBe(newSettings.organizationName);
      expect(getRes.body.maintenanceMode).toBe(true);
      expect(typeof getRes.body.maintenanceMode).toBe('boolean');
      expect(getRes.body.mapCenterLat).toBeCloseTo(newSettings.mapCenterLat, 6);
      expect(typeof getRes.body.mapCenterLat).toBe('number');
      expect(getRes.body.mapCenterLng).toBeCloseTo(newSettings.mapCenterLng, 6);
      expect(typeof getRes.body.mapCenterLng).toBe('number');
    });
  });
});
