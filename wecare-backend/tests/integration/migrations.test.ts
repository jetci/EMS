import fs from 'fs';
import path from 'path';
import request from 'supertest';
import express from 'express';
import authRoutes from '../../src/routes/auth';
import systemRoutes from '../../src/routes/system';
import { initializeDatabase, sqliteDB } from '../../src/db/sqliteDB';

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

describe('Database migrations create safety backup before applying', () => {
  let adminToken: string;
  const backupsDir = path.join(__dirname, '..', '..', 'backups');

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    process.env.ENABLE_DEV_DB_RESET = 'true';
    process.env.ENABLE_DEV_DB_SEED = 'true';

    await initializeDatabase();
    adminToken = await loginAdmin();

    // Ensure backups directory exists
    if (!fs.existsSync(backupsDir)) {
      fs.mkdirSync(backupsDir, { recursive: true });
    }

    // Cleanup existing safety backups to get a clean baseline
    const files = fs.readdirSync(backupsDir);
    for (const f of files) {
      if (f.startsWith('wecare_before_migrate_') && f.endsWith('.db')) {
        try { fs.unlinkSync(path.join(backupsDir, f)); } catch {}
      }
    }

    // Use system reset to reinitialize schema to v1 (without applying migrations)
    const resetRes = await request(app)
      .post('/api/admin/system/reset-db')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({});
    expect([200, 201]).toContain(resetRes.status);
  });

  afterAll(() => {
    try { sqliteDB.close(); } catch {}
  });

  test('initializeDatabase applies migrations and creates safety backup', async () => {
    // Capture time reference before migration
    const startTime = Date.now();

    // Run initialization to apply migrations and seed data
    await initializeDatabase();

    // Verify schema version advanced to latest
    const db = sqliteDB.getInstance();
    const latestVersion = 5; // Keep in sync with sqliteDB.ts migration list
    const currentVersion = db.pragma('user_version', { simple: true }) as number;
    expect(currentVersion).toBeGreaterThanOrEqual(latestVersion);

    // Verify a safety backup has been created
    const files = fs.readdirSync(backupsDir)
      .filter(f => f.startsWith('wecare_before_migrate_') && f.endsWith('.db'))
      .map(f => ({ name: f, path: path.join(backupsDir, f), mtime: fs.statSync(path.join(backupsDir, f)).mtime }))
      .sort((a, b) => b.mtime.getTime() - a.mtime.getTime());

    expect(files.length).toBeGreaterThan(0);

    // Check latest safety backup looks recent and non-empty
    const latest = files[0];
    expect(latest).toBeDefined();
    const size = fs.statSync(latest.path).size;
    expect(size).toBeGreaterThan(0);
    expect(latest.mtime.getTime()).toBeGreaterThanOrEqual(startTime);
  });
});