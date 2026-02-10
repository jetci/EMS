import request from 'supertest'
import express from 'express'
import backupRoutes from '../../src/routes/backup'
import authRoutes from '../../src/routes/auth'
import { initializeDatabase, sqliteDB } from '../../src/db/sqliteDB'
import { authenticateToken } from '../../src/middleware/auth'
import { requireRole, UserRole } from '../../src/middleware/roleProtection'

const app = express()
app.use(express.json())
app.use('/api', authRoutes)
app.use('/api/backup',
  authenticateToken,
  requireRole([UserRole.ADMIN, UserRole.DEVELOPER]),
  backupRoutes
)

async function login(email: string, password: string): Promise<string> {
  const res = await request(app).post('/api/auth/login').send({ email, password })
  if (res.status === 200 && res.body?.token) return res.body.token
  throw new Error(`Login failed for ${email}: ${res.status}`)
}

async function loginAdmin(): Promise<string> {
  const credentials = [
    { email: 'admin@wecare.ems', password: 'password123' },
    { email: 'admin@wecare.ems', password: 'Admin@123' },
  ]

  for (const cred of credentials) {
    try {
      const token = await login(cred.email, cred.password)
      return token
    } catch {}
  }
  throw new Error('Admin login failed')
}

async function loginOfficer(): Promise<string> {
  const token = await login('officer1@wecare.dev', 'password123')
  return token
}

describe('Backup Routes (/api/backup)', () => {
  let adminToken: string
  let officerToken: string
  let createdFilename: string | null = null

  beforeAll(async () => {
    // Initialize database and seed users
    await initializeDatabase()
    // Obtain tokens
    adminToken = await loginAdmin()
    officerToken = await loginOfficer()
  })

  afterAll(() => {
    try { sqliteDB.close() } catch {}
  })

  test('POST /api/backup/create should create a backup (ADMIN only)', async () => {
    const res = await request(app)
      .post('/api/backup/create')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({})

    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('success', true)
    expect(res.body).toHaveProperty('backup')
    expect(res.body.backup).toHaveProperty('filename')
    expect(res.body.backup).toHaveProperty('size')
    expect(res.body.backup).toHaveProperty('timestamp')

    createdFilename = res.body.backup.filename
  })

  test('GET /api/backup/list should return backups list (ADMIN only)', async () => {
    const res = await request(app)
      .get('/api/backup/list')
      .set('Authorization', `Bearer ${adminToken}`)
      .send()

    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('success', true)
    expect(res.body).toHaveProperty('count')
    expect(res.body).toHaveProperty('backups')
    expect(Array.isArray(res.body.backups)).toBe(true)
    expect(res.body.count).toBeGreaterThanOrEqual(1)
  })

  test('GET /api/backup/stats should return backup statistics (ADMIN only)', async () => {
    const res = await request(app)
      .get('/api/backup/stats')
      .set('Authorization', `Bearer ${adminToken}`)
      .send()

    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('success', true)
    expect(res.body).toHaveProperty('stats')
    expect(res.body.stats).toHaveProperty('totalBackups')
    expect(res.body.stats.totalBackups).toBeGreaterThanOrEqual(1)
    expect(res.body.stats).toHaveProperty('config')
  })

  test('GET /api/backup/download/:filename should download backup file (ADMIN only)', async () => {
    expect(createdFilename).not.toBeNull()
    const res = await request(app)
      .get(`/api/backup/download/${createdFilename}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send()

    expect(res.status).toBe(200)
    // Content-Type usually is application/octet-stream for downloads
    expect(res.headers['content-type']).toMatch(/octet-stream|binary|application/) // be flexible across environments
  })

  test('POST /api/backup/verify/:filename should verify backup (ADMIN only)', async () => {
    expect(createdFilename).not.toBeNull()
    const res = await request(app)
      .post(`/api/backup/verify/${createdFilename}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({})

    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('success', true)
    expect(res.body).toHaveProperty('message', 'Backup is valid')
  })

  test('POST /api/backup/cleanup should cleanup old backups (ADMIN only)', async () => {
    const res = await request(app)
      .post('/api/backup/cleanup')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({})

    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('success', true)
    expect(res.body).toHaveProperty('message', 'Cleanup completed')
    expect(res.body).toHaveProperty('deletedBackups')
    expect(res.body).toHaveProperty('keptBackups')
  })

  test('Backup routes should be forbidden for non-admin roles (OFFICER)', async () => {
    const res = await request(app)
      .get('/api/backup/list')
      .set('Authorization', `Bearer ${officerToken}`)
      .send()

    expect(res.status).toBe(403)
    expect(res.body).toHaveProperty('error')
  })
})