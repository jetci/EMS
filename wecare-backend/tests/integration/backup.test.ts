import request from 'supertest'
import app from '../../src/index'
import { initializeSchema, seedData } from '../../src/db/postgresDB'

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
    process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/wecare_test'
    await initializeSchema()
    await seedData()
    // Obtain tokens
    adminToken = await loginAdmin()
    officerToken = await loginOfficer()
  })

  test('POST /api/backup/create should respond with not supported in PostgreSQL mode', async () => {
    const res = await request(app)
      .post('/api/backup/create')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({})

    expect(res.status).toBe(500)
    expect(res.body).toHaveProperty('success', false)
    expect(res.body).toHaveProperty('error')
    createdFilename = null
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
    expect(res.body.count).toBeGreaterThanOrEqual(0)
  })

  test('GET /api/backup/stats should return empty backup statistics (ADMIN only)', async () => {
    const res = await request(app)
      .get('/api/backup/stats')
      .set('Authorization', `Bearer ${adminToken}`)
      .send()

    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('success', true)
    expect(res.body).toHaveProperty('stats')
    expect(res.body.stats).toHaveProperty('totalBackups')
    expect(res.body.stats.totalBackups).toBeGreaterThanOrEqual(0)
    expect(res.body.stats).toHaveProperty('config')
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
