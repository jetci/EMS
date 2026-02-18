import request from 'supertest'
import express from 'express'
import systemRoutes from '../../src/routes/system'
import authRoutes from '../../src/routes/auth'
import { initializeSchema, seedData } from '../../src/db/postgresDB'

const app = express()
app.use(express.json())
app.use('/api', authRoutes)
app.use('/api/admin/system', systemRoutes)

async function loginAdmin(): Promise<string> {
  const credentials = [
    { email: 'admin@wecare.ems', password: 'password123' },
    { email: 'admin@wecare.ems', password: 'Admin@123' },
  ]

  for (const cred of credentials) {
    const res = await request(app).post('/api/auth/login').send(cred)
    if (res.status === 200 && res.body?.token) return res.body.token
  }
  throw new Error('Admin login failed')
}

describe('System routes guards (production blocking)', () => {
  let adminToken: string

  beforeAll(async () => {
    process.env.NODE_ENV = 'production'
    process.env.ENABLE_DEV_DB_RESET = 'false'
    process.env.ENABLE_DEV_DB_SEED = 'false'
    process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/wecare_test'
    await initializeSchema()
    await seedData()
    adminToken = await loginAdmin()
  })

  afterAll(() => {
  })

  test('POST /api/admin/system/reset-db should be blocked in production', async () => {
    const res = await request(app)
      .post('/api/admin/system/reset-db')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({})
    expect(res.status).toBe(403)
    expect(res.body).toHaveProperty('error')
  })

  test('POST /api/admin/system/seed-users should be blocked in production', async () => {
    const res = await request(app)
      .post('/api/admin/system/seed-users')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({})
    expect(res.status).toBe(403)
    expect(res.body).toHaveProperty('error')
  })
})
