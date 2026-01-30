# 🧪 TEST-001: No Unit Tests - Implementation Plan

**Priority:** 🔴 CRITICAL  
**Estimated Time:** 2-3 weeks  
**Complexity:** HIGH  
**Status:** 📋 PLANNED

---

## 📋 Executive Summary

### Problem Statement
The EMS WeCare system currently has **zero unit test coverage**, making it:
- Difficult to verify code correctness
- Risky to refactor or add features
- Hard to catch regressions early
- Not following industry best practices

### Objective
Implement a comprehensive unit testing framework with:
- ✅ Minimum 70% code coverage
- ✅ Automated test execution
- ✅ CI/CD integration ready
- ✅ Test documentation

### Success Criteria
- [ ] Test framework setup complete
- [ ] 70%+ code coverage achieved
- [ ] All critical paths tested
- [ ] Tests run in CI/CD pipeline
- [ ] Team trained on testing practices

---

## 🎯 Phase 1: Setup & Infrastructure (Week 1, Days 1-2)

### 1.1 Choose Testing Framework

**Recommended:** Jest + Supertest

**Rationale:**
- ✅ Industry standard for Node.js/TypeScript
- ✅ Built-in mocking capabilities
- ✅ Excellent TypeScript support
- ✅ Great documentation
- ✅ Fast execution

**Installation:**
```bash
cd wecare-backend
npm install --save-dev jest @types/jest ts-jest supertest @types/supertest
npm install --save-dev @jest/globals
```

**Configuration:**
```javascript
// jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/tests'],
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/index.ts'
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  },
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts']
};
```

### 1.2 Create Test Directory Structure

```
wecare-backend/
├── tests/
│   ├── setup.ts                    # Test setup & teardown
│   ├── helpers/                    # Test utilities
│   │   ├── testDb.ts              # Test database helper
│   │   ├── mockData.ts            # Mock data generators
│   │   └── testServer.ts          # Test server setup
│   ├── unit/                       # Unit tests
│   │   ├── utils/
│   │   │   ├── password.test.ts
│   │   │   └── validation.test.ts
│   │   ├── services/
│   │   │   ├── auditService.test.ts
│   │   │   ├── backupService.test.ts
│   │   │   └── accountLockoutService.test.ts
│   │   └── middleware/
│   │       ├── auth.test.ts
│   │       ├── roleProtection.test.ts
│   │       └── validation.test.ts
│   └── integration/                # Integration tests
│       ├── auth.test.ts
│       ├── patients.test.ts
│       ├── drivers.test.ts
│       ├── rides.test.ts
│       └── users.test.ts
```

### 1.3 Setup Test Database

**File:** `tests/helpers/testDb.ts`

```typescript
import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

const TEST_DB_PATH = path.join(__dirname, '../../test.db');

export function setupTestDatabase(): Database.Database {
  // Remove existing test db
  if (fs.existsSync(TEST_DB_PATH)) {
    fs.unlinkSync(TEST_DB_PATH);
  }

  const db = new Database(TEST_DB_PATH);
  
  // Load schema
  const schema = fs.readFileSync(
    path.join(__dirname, '../../db/schema.sql'),
    'utf-8'
  );
  db.exec(schema);

  return db;
}

export function teardownTestDatabase(): void {
  if (fs.existsSync(TEST_DB_PATH)) {
    fs.unlinkSync(TEST_DB_PATH);
  }
}

export function seedTestData(db: Database.Database): void {
  // Insert test users
  const testUsers = [
    {
      id: 'TEST-USER-001',
      email: 'test@example.com',
      password: '$2b$10$...',  // hashed "password123"
      role: 'admin',
      full_name: 'Test Admin',
      date_created: new Date().toISOString(),
      status: 'Active'
    }
    // ... more test data
  ];

  testUsers.forEach(user => {
    db.prepare(`
      INSERT INTO users (id, email, password, role, full_name, date_created, status)
      VALUES (@id, @email, @password, @role, @full_name, @date_created, @status)
    `).run(user);
  });
}
```

**Deliverables:**
- [ ] Jest configuration file
- [ ] Test directory structure
- [ ] Test database helper
- [ ] Mock data generators
- [ ] Test setup/teardown scripts

**Time:** 2 days

---

## 🧪 Phase 2: Unit Tests - Utilities (Week 1, Days 3-4)

### 2.1 Password Utility Tests

**File:** `tests/unit/utils/password.test.ts`

**Test Cases:**
```typescript
describe('Password Utilities', () => {
  describe('hashPassword', () => {
    it('should hash password successfully', async () => {
      const password = 'TestPass123!';
      const hash = await hashPassword(password);
      expect(hash).toBeDefined();
      expect(hash).not.toBe(password);
      expect(hash.startsWith('$2b$')).toBe(true);
    });

    it('should generate different hashes for same password', async () => {
      const password = 'TestPass123!';
      const hash1 = await hashPassword(password);
      const hash2 = await hashPassword(password);
      expect(hash1).not.toBe(hash2);
    });
  });

  describe('verifyPassword', () => {
    it('should verify correct password', async () => {
      const password = 'TestPass123!';
      const hash = await hashPassword(password);
      const isValid = await verifyPassword(password, hash);
      expect(isValid).toBe(true);
    });

    it('should reject incorrect password', async () => {
      const password = 'TestPass123!';
      const hash = await hashPassword(password);
      const isValid = await verifyPassword('WrongPass123!', hash);
      expect(isValid).toBe(false);
    });
  });

  describe('validatePasswordStrength', () => {
    it('should accept strong password', () => {
      const result = validatePasswordStrength('StrongPass123!');
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject password without uppercase', () => {
      const result = validatePasswordStrength('weakpass123!');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one uppercase letter');
    });

    it('should reject short password', () => {
      const result = validatePasswordStrength('Pass1!');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Password must be at least 8 characters long');
    });

    it('should reject password without special character', () => {
      const result = validatePasswordStrength('Password123');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one special character');
    });
  });

  describe('isCommonPassword', () => {
    it('should detect common passwords', () => {
      expect(isCommonPassword('password')).toBe(true);
      expect(isCommonPassword('123456')).toBe(true);
      expect(isCommonPassword('admin')).toBe(true);
    });

    it('should accept uncommon passwords', () => {
      expect(isCommonPassword('MyUniquePass123!')).toBe(false);
    });
  });

  describe('calculatePasswordStrength', () => {
    it('should give high score to strong password', () => {
      const score = calculatePasswordStrength('VeryStr0ng!Pass@2024');
      expect(score).toBeGreaterThan(70);
    });

    it('should give low score to weak password', () => {
      const score = calculatePasswordStrength('password');
      expect(score).toBeLessThan(50);
    });
  });
});
```

**Coverage Target:** 90%+

### 2.2 Validation Middleware Tests

**Test Cases:**
- Input sanitization
- SQL injection prevention
- XSS prevention
- Email validation
- Phone number validation

**Deliverables:**
- [ ] Password utility tests (15+ test cases)
- [ ] Validation middleware tests (20+ test cases)
- [ ] Mock data generators
- [ ] Test coverage report

**Time:** 2 days

---

## 🔐 Phase 3: Unit Tests - Services (Week 1, Day 5 - Week 2, Day 2)

### 3.1 Audit Service Tests

**File:** `tests/unit/services/auditService.test.ts`

**Test Cases:**
```typescript
describe('Audit Service', () => {
  let testDb: Database.Database;

  beforeEach(() => {
    testDb = setupTestDatabase();
  });

  afterEach(() => {
    teardownTestDatabase();
  });

  it('should log audit entry successfully', () => {
    auditService.log('test@example.com', 'admin', 'LOGIN', 'USER-001');
    
    const logs = testDb.prepare('SELECT * FROM audit_logs').all();
    expect(logs).toHaveLength(1);
    expect(logs[0].action).toBe('LOGIN');
  });

  it('should include metadata in audit log', () => {
    const metadata = { ip: '127.0.0.1', userAgent: 'Test' };
    auditService.log('test@example.com', 'admin', 'LOGIN', 'USER-001', metadata);
    
    const log = testDb.prepare('SELECT * FROM audit_logs WHERE action = ?').get('LOGIN');
    expect(JSON.parse(log.metadata)).toEqual(metadata);
  });
});
```

### 3.2 Account Lockout Service Tests

**Test Cases:**
- Record failed attempt
- Check account locked status
- Clear failed attempts
- Unlock account
- Cleanup expired attempts
- Get lockout statistics

### 3.3 Backup Service Tests

**Test Cases:**
- Create backup
- List backups
- Verify backup
- Restore backup
- Cleanup old backups
- Get backup stats

**Deliverables:**
- [ ] Audit service tests (10+ test cases)
- [ ] Account lockout tests (15+ test cases)
- [ ] Backup service tests (12+ test cases)
- [ ] Test coverage > 80%

**Time:** 3 days

---

## 🛣️ Phase 4: Integration Tests - API Endpoints (Week 2, Days 3-5)

### 4.1 Auth Endpoints Tests

**File:** `tests/integration/auth.test.ts`

**Test Cases:**
```typescript
import request from 'supertest';
import app from '../../src/index';

describe('Auth API', () => {
  describe('POST /api/auth/login', () => {
    it('should login with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin@wecare.dev',
          password: 'password'
        })
        .expect(200);

      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe('admin@wecare.dev');
    });

    it('should reject invalid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin@wecare.dev',
          password: 'wrongpassword'
        })
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });

    it('should lock account after 5 failed attempts', async () => {
      // Attempt 5 failed logins
      for (let i = 0; i < 5; i++) {
        await request(app)
          .post('/api/auth/login')
          .send({
            email: 'test@example.com',
            password: 'wrongpassword'
          });
      }

      // 6th attempt should be locked
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'anypassword'
        })
        .expect(423);

      expect(response.body.error).toContain('locked');
    });
  });

  describe('POST /api/auth/register', () => {
    it('should register new user with strong password', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'newuser@example.com',
          password: 'StrongPass123!',
          name: 'New User'
        })
        .expect(201);

      expect(response.body).toHaveProperty('token');
      expect(response.body.user.email).toBe('newuser@example.com');
    });

    it('should reject weak password', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'newuser@example.com',
          password: 'weak'
        })
        .expect(400);

      expect(response.body.error).toContain('Password validation failed');
    });
  });
});
```

### 4.2 Protected Endpoints Tests

**Test Cases:**
- Patients API (CRUD operations)
- Drivers API (CRUD operations)
- Rides API (CRUD operations)
- Users API (CRUD operations)
- Role-based access control

**Deliverables:**
- [ ] Auth API tests (20+ test cases)
- [ ] Patients API tests (15+ test cases)
- [ ] Drivers API tests (12+ test cases)
- [ ] Rides API tests (15+ test cases)
- [ ] Users API tests (12+ test cases)
- [ ] RBAC tests (25+ test cases)

**Time:** 3 days

---

## 📊 Phase 5: Coverage & Reporting (Week 3, Days 1-2)

### 5.1 Generate Coverage Reports

**Commands:**
```bash
# Run tests with coverage
npm test -- --coverage

# Generate HTML report
npm test -- --coverage --coverageReporters=html

# Generate lcov for CI/CD
npm test -- --coverage --coverageReporters=lcov
```

### 5.2 Coverage Targets

| Module | Target | Priority |
|--------|--------|----------|
| **Utils** | 90%+ | HIGH |
| **Services** | 85%+ | HIGH |
| **Middleware** | 80%+ | HIGH |
| **Routes** | 75%+ | MEDIUM |
| **Overall** | 70%+ | REQUIRED |

### 5.3 CI/CD Integration

**GitHub Actions Example:**
```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm ci
      - name: Run tests
        run: npm test -- --coverage
      - name: Upload coverage
        uses: codecov/codecov-action@v2
```

**Deliverables:**
- [ ] Coverage reports generated
- [ ] Coverage thresholds met
- [ ] CI/CD pipeline configured
- [ ] Badge added to README

**Time:** 2 days

---

## 📚 Phase 6: Documentation & Training (Week 3, Days 3-5)

### 6.1 Testing Documentation

**Create:** `TESTING.md`

**Contents:**
- How to run tests
- How to write new tests
- Testing best practices
- Mocking guidelines
- Coverage requirements

### 6.2 Team Training

**Topics:**
- Jest basics
- Writing unit tests
- Writing integration tests
- Mocking strategies
- TDD principles

**Deliverables:**
- [ ] Testing documentation
- [ ] Training materials
- [ ] Code examples
- [ ] Team training session

**Time:** 3 days

---

## ✅ Acceptance Criteria

### Must Have:
- [x] Jest framework setup complete
- [x] Test database helper implemented
- [x] 70%+ code coverage achieved
- [x] All critical paths tested
- [x] CI/CD integration ready
- [x] Documentation complete

### Should Have:
- [ ] 80%+ code coverage
- [ ] Performance tests
- [ ] Load tests
- [ ] E2E tests

### Nice to Have:
- [ ] Visual regression tests
- [ ] Mutation testing
- [ ] Contract testing

---

## 📈 Progress Tracking

### Week 1:
- [ ] Day 1-2: Setup & Infrastructure
- [ ] Day 3-4: Utility Tests
- [ ] Day 5: Service Tests (Part 1)

### Week 2:
- [ ] Day 1-2: Service Tests (Part 2)
- [ ] Day 3-5: Integration Tests

### Week 3:
- [ ] Day 1-2: Coverage & Reporting
- [ ] Day 3-5: Documentation & Training

---

## 🚨 Risks & Mitigation

### Risk 1: Low Initial Coverage
**Mitigation:** Focus on critical paths first, then expand

### Risk 2: Slow Test Execution
**Mitigation:** Use test database in memory, parallel execution

### Risk 3: Flaky Tests
**Mitigation:** Proper setup/teardown, avoid time-dependent tests

### Risk 4: Team Resistance
**Mitigation:** Show value early, provide training, make it easy

---

## 💰 Resource Requirements

### Team:
- 1 Senior Developer (full-time, 3 weeks)
- 1 QA Engineer (part-time, 2 weeks)

### Tools:
- Jest (free)
- Supertest (free)
- Coverage tools (free)
- CI/CD platform (GitHub Actions - free)

### Estimated Cost:
- Labor: ~$6,000 - $9,000
- Tools: $0
- **Total: $6,000 - $9,000**

---

## 📊 Success Metrics

### Quantitative:
- ✅ 70%+ code coverage
- ✅ 100+ test cases
- ✅ < 5 minutes test execution time
- ✅ 0 failing tests in main branch

### Qualitative:
- ✅ Team confident in making changes
- ✅ Faster bug detection
- ✅ Reduced regression issues
- ✅ Better code quality

---

## 🎯 Next Steps

1. **Week 1:** Get approval and allocate resources
2. **Week 2:** Begin Phase 1 (Setup)
3. **Week 3:** Continue with utility and service tests
4. **Week 4:** Complete integration tests
5. **Week 5:** Documentation and training

---

**Status:** 📋 READY FOR IMPLEMENTATION  
**Owner:** Development Team  
**Reviewer:** QA Team  
**Approver:** Technical Lead

**Last Updated:** 2026-01-08  
**Version:** 1.0
