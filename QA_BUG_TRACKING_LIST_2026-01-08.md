# 🐛 EMS WeCare - Bug Tracking List
## Complete Issue Registry

**วันที่:** 2026-01-08  
**จำนวนทั้งหมด:** 48 Issues  
**สถานะ:** Ready for Assignment

---

## 📊 สรุปตามความสำคัญ

| Priority | จำนวน | เปอร์เซ็นต์ |
|----------|-------|-------------|
| 🔴 Critical | 8 | 17% |
| 🟠 High | 15 | 31% |
| 🟡 Medium | 18 | 38% |
| 🟢 Low | 7 | 14% |

---

## 🔴 CRITICAL PRIORITY (8 Issues)

### SEC-001: JWT Secret in Plain Text Environment Variable
- **Category:** Security
- **Location:** `.env` file, `src/index.ts`
- **Impact:** If `.env` is compromised, all tokens can be forged
- **Effort:** Medium (1 week)
- **Fix:** Implement secrets management service (AWS Secrets Manager, HashiCorp Vault)
- **Assigned:** [ ]
- **Status:** ⏳ Pending

### SEC-004: No HTTPS Enforcement
- **Category:** Security
- **Location:** Server configuration
- **Impact:** Man-in-the-middle attacks possible
- **Effort:** Low (2-3 days)
- **Fix:** Add HTTPS redirect middleware, enforce in production
- **Assigned:** [ ]
- **Status:** ⏳ Pending

### PERF-001: No Database Connection Pooling
- **Category:** Performance
- **Location:** `db/sqliteDB.ts`
- **Impact:** Severe performance degradation
- **Effort:** Medium (3-5 days)
- **Fix:** Use persistent connection with better-sqlite3
- **Assigned:** [ ]
- **Status:** ⏳ Pending

### BUG-DB-005: No Database Backup Strategy
- **Category:** Database
- **Location:** Infrastructure
- **Impact:** Data loss risk
- **Effort:** Medium (1 week)
- **Fix:** Implement daily automated backups with retention policy
- **Assigned:** [ ]
- **Status:** ⏳ Pending

### BUG-BE-001: Missing Role Validation at Router Level
- **Category:** Backend / Security
- **Location:** `src/index.ts` lines 153-159
- **Impact:** Potential unauthorized access
- **Effort:** Low (1 week)
- **Fix:** Add `requireRole()` middleware to sensitive routes
- **Assigned:** [ ]
- **Status:** ⏳ Pending

### BUG-BE-004: CORS Configuration Issues in Production
- **Category:** Backend
- **Location:** `src/index.ts` lines 69-74
- **Impact:** Server won't start without proper config
- **Effort:** Low (1 day)
- **Fix:** Provide default secure origins, better error messages
- **Assigned:** [ ]
- **Status:** ⏳ Pending

### BUG-DB-006: SQLite Scalability Limitations
- **Category:** Database / Architecture
- **Location:** Architecture decision
- **Impact:** Write bottleneck, limited concurrent users
- **Effort:** High (3-4 weeks)
- **Fix:** Plan migration to PostgreSQL or MySQL
- **Assigned:** [ ]
- **Status:** ⏳ Pending

### TEST-001: No Unit Tests
- **Category:** Testing
- **Location:** Entire codebase
- **Impact:** Cannot verify function correctness
- **Effort:** High (2-3 weeks)
- **Fix:** Implement Jest for backend, React Testing Library for frontend
- **Assigned:** [ ]
- **Status:** ⏳ Pending

---

## 🟠 HIGH PRIORITY (15 Issues)

### SEC-002: No Password Complexity Requirements
- **Category:** Security
- **Location:** User registration endpoint
- **Impact:** Weak passwords allowed, brute force attacks
- **Effort:** Low (2-3 days)
- **Fix:** Enforce min 8 chars, uppercase, lowercase, number, symbol
- **Assigned:** [ ]
- **Status:** ⏳ Pending

### SEC-003: No Account Lockout Mechanism
- **Category:** Security
- **Location:** Login endpoint
- **Impact:** Unlimited login attempts, brute force attacks
- **Effort:** Medium (1 week)
- **Fix:** Lock account after 5 failed attempts
- **Assigned:** [ ]
- **Status:** ⏳ Pending

### SEC-005: File Upload Path Traversal Risk
- **Category:** Security
- **Location:** File upload handler
- **Impact:** Arbitrary file write
- **Effort:** Medium (3-5 days)
- **Fix:** Use UUID for filenames, validate path
- **Assigned:** [ ]
- **Status:** ⏳ Pending

### PERF-002: N+1 Query Problem
- **Category:** Performance
- **Location:** Patient list endpoint
- **Impact:** Slow response times for large datasets
- **Effort:** Medium (1 week)
- **Fix:** Use JOIN or batch queries
- **Assigned:** [ ]
- **Status:** ⏳ Pending

### PERF-003: No Response Caching
- **Category:** Performance
- **Location:** All GET endpoints
- **Impact:** Unnecessary database queries
- **Effort:** Medium (1 week)
- **Fix:** Implement ETag and Cache-Control headers
- **Assigned:** [ ]
- **Status:** ⏳ Pending

### BUG-FE-001: Inconsistent API Response Handling
- **Category:** Frontend
- **Location:** `PatientDetailPage.tsx` lines 43-46
- **Impact:** Potential runtime errors if API changes
- **Effort:** Low (1-2 days)
- **Fix:** Standardize API responses to always return paginated format
- **Assigned:** [ ]
- **Status:** ⏳ Pending

### BUG-BE-003: No Request Timeout on Database Queries
- **Category:** Backend
- **Location:** All SQLite queries
- **Impact:** Server becomes unresponsive
- **Effort:** Medium (3-5 days)
- **Fix:** Implement query timeout (5 seconds)
- **Assigned:** [ ]
- **Status:** ⏳ Pending

### BUG-BE-005: WebSocket Authentication Bypass Risk
- **Category:** Backend / Security
- **Location:** `src/index.ts` lines 205-232
- **Impact:** Potential token verification bypass
- **Effort:** Low (2-3 days)
- **Fix:** Use centralized JWT verification function
- **Assigned:** [ ]
- **Status:** ⏳ Pending

### BUG-BE-007: Multer File Upload Validation Incomplete
- **Category:** Backend / Security
- **Location:** `routes/patients.ts` lines 47-84
- **Impact:** Malicious files could be uploaded
- **Effort:** Medium (3-5 days)
- **Fix:** Add magic number validation (file signature check)
- **Assigned:** [ ]
- **Status:** ⏳ Pending

### BUG-API-001: Inconsistent Response Formats
- **Category:** API
- **Location:** Multiple endpoints
- **Impact:** Frontend must handle multiple formats
- **Effort:** Medium (1 week)
- **Fix:** Standardize all list responses to paginated format
- **Assigned:** [ ]
- **Status:** ⏳ Pending

### BUG-RBAC-001: Role Check Case Sensitivity
- **Category:** Security / RBAC
- **Location:** `middleware/auth.ts`, `schema.sql`
- **Impact:** Role checks may fail due to case mismatch
- **Effort:** Low (2-3 days)
- **Fix:** Normalize all roles to uppercase or lowercase
- **Assigned:** [ ]
- **Status:** ⏳ Pending

### TEST-002: No Integration Tests
- **Category:** Testing
- **Location:** API layer
- **Impact:** Cannot verify API contract
- **Effort:** High (2 weeks)
- **Fix:** Implement Supertest for API testing
- **Assigned:** [ ]
- **Status:** ⏳ Pending

### TEST-003: No E2E Tests
- **Category:** Testing
- **Location:** User workflows
- **Impact:** Cannot verify user workflows
- **Effort:** High (2 weeks)
- **Fix:** Implement Playwright or Cypress
- **Assigned:** [ ]
- **Status:** ⏳ Pending

### TEST-004: No CI/CD Pipeline
- **Category:** DevOps
- **Location:** Infrastructure
- **Impact:** Manual deployment, high error risk
- **Effort:** Medium (1 week)
- **Fix:** Implement GitHub Actions or GitLab CI
- **Assigned:** [ ]
- **Status:** ⏳ Pending

### PERF-007: No Image Optimization
- **Category:** Performance
- **Location:** File upload
- **Impact:** Large file sizes, slow loads
- **Effort:** Medium (1 week)
- **Fix:** Resize and compress images on upload
- **Assigned:** [ ]
- **Status:** ⏳ Pending

---

## 🟡 MEDIUM PRIORITY (18 Issues)

### SEC-006: No Content Security Policy
- **Category:** Security
- **Location:** Helmet configuration
- **Impact:** XSS attacks
- **Effort:** Low (2-3 days)
- **Fix:** Enable CSP in production
- **Assigned:** [ ]
- **Status:** ⏳ Pending

### SEC-007: Sensitive Data in Logs
- **Category:** Security
- **Location:** Console.log statements
- **Impact:** Information disclosure
- **Effort:** Low (2-3 days)
- **Fix:** Sanitize logs, use proper logging library
- **Assigned:** [ ]
- **Status:** ⏳ Pending

### SEC-008: No Session Timeout
- **Category:** Security
- **Location:** JWT configuration
- **Impact:** Stolen tokens valid indefinitely
- **Effort:** Low (1-2 days)
- **Fix:** Set reasonable expiry (1 hour) with refresh tokens
- **Assigned:** [ ]
- **Status:** ⏳ Pending

### PERF-004: Large JSON Parsing Overhead
- **Category:** Performance
- **Location:** Patient routes
- **Impact:** CPU overhead
- **Effort:** Low (2-3 days)
- **Fix:** Cache parsed JSON or use database JSON functions
- **Assigned:** [ ]
- **Status:** ⏳ Pending

### PERF-005: No Database Query Optimization
- **Category:** Performance
- **Location:** Complex queries
- **Impact:** Slow queries
- **Effort:** Medium (1 week)
- **Fix:** Analyze and optimize with EXPLAIN QUERY PLAN
- **Assigned:** [ ]
- **Status:** ⏳ Pending

### BUG-FE-002: No Loading State During API Calls
- **Category:** Frontend / UX
- **Location:** Multiple pages
- **Impact:** Poor UX
- **Effort:** Low (2-3 days)
- **Fix:** Implement consistent loading states
- **Assigned:** [ ]
- **Status:** ⏳ Pending

### BUG-FE-004: No Error Boundary for API Failures
- **Category:** Frontend
- **Location:** API service layer
- **Impact:** White screen of death
- **Effort:** Low (1-2 days)
- **Fix:** Wrap all pages with ErrorBoundary
- **Assigned:** [ ]
- **Status:** ⏳ Pending

### BUG-BE-002: Inconsistent Error Response Format
- **Category:** Backend
- **Location:** Multiple route files
- **Impact:** Frontend must handle multiple formats
- **Effort:** Medium (1 week)
- **Fix:** Standardize to `{ error: { message, code, details } }`
- **Assigned:** [ ]
- **Status:** ⏳ Pending

### BUG-BE-006: No Rate Limiting on WebSocket
- **Category:** Backend / Security
- **Location:** WebSocket namespace
- **Impact:** Potential DoS attack
- **Effort:** Low (2-3 days)
- **Fix:** Implement connection rate limiting
- **Assigned:** [ ]
- **Status:** ⏳ Pending

### BUG-BE-008: No Pagination Limit Cap
- **Category:** Backend
- **Location:** Pagination utility
- **Impact:** Memory exhaustion, slow queries
- **Effort:** Low (1 day)
- **Fix:** Cap limit at 100 records per page
- **Assigned:** [ ]
- **Status:** ⏳ Pending

### BUG-DB-001: Latitude/Longitude Stored as TEXT
- **Category:** Database
- **Location:** `schema.sql` lines 51-52
- **Impact:** Cannot use spatial queries
- **Effort:** Medium (3-5 days)
- **Fix:** Change to REAL type, add CHECK constraints
- **Assigned:** [ ]
- **Status:** ⏳ Pending

### BUG-DB-002: No Soft Delete Mechanism
- **Category:** Database
- **Location:** All tables
- **Impact:** Accidental deletions are permanent
- **Effort:** Low (2-3 days)
- **Fix:** Add `deleted_at` column, implement soft deletes
- **Assigned:** [ ]
- **Status:** ⏳ Pending

### BUG-DB-004: Missing Indexes on Foreign Keys
- **Category:** Database / Performance
- **Location:** Various tables
- **Impact:** Slow JOIN queries
- **Effort:** Low (1 day)
- **Fix:** Add indexes on all foreign key columns
- **Assigned:** [ ]
- **Status:** ⏳ Pending

### BUG-API-002: No API Versioning
- **Category:** API
- **Location:** All routes
- **Impact:** Breaking changes affect all clients
- **Effort:** Medium (1 week)
- **Fix:** Implement `/api/v1/` prefix
- **Assigned:** [ ]
- **Status:** ⏳ Pending

### BUG-API-005: Inconsistent Date Formats
- **Category:** API
- **Location:** Multiple endpoints
- **Impact:** Parsing errors in frontend
- **Effort:** Low (2-3 days)
- **Fix:** Use ISO 8601 consistently
- **Assigned:** [ ]
- **Status:** ⏳ Pending

### BUG-RBAC-002: No Role Hierarchy
- **Category:** RBAC
- **Location:** Authorization logic
- **Impact:** Must explicitly grant each permission
- **Effort:** Medium (1 week)
- **Fix:** Implement role hierarchy
- **Assigned:** [ ]
- **Status:** ⏳ Pending

### BUG-RBAC-003: Hardcoded Role Checks
- **Category:** Code Quality / RBAC
- **Location:** Multiple files
- **Impact:** Difficult to maintain
- **Effort:** Medium (1 week)
- **Fix:** Centralize permission checks in service
- **Assigned:** [ ]
- **Status:** ⏳ Pending

### BUG-RBAC-005: Missing Audit Log for Permission Denials
- **Category:** Security / Audit
- **Location:** Authorization middleware
- **Impact:** Cannot detect unauthorized access attempts
- **Effort:** Low (1-2 days)
- **Fix:** Log all 403 responses
- **Assigned:** [ ]
- **Status:** ⏳ Pending

---

## 🟢 LOW PRIORITY (7 Issues)

### BUG-FE-003: Alert() Usage Instead of Toast
- **Category:** Frontend / UX
- **Location:** `PatientDetailPage.tsx` lines 63, 66
- **Impact:** Inconsistent UX
- **Effort:** Low (1 day)
- **Fix:** Replace all `alert()` with Toast component
- **Assigned:** [ ]
- **Status:** ⏳ Pending

### BUG-FE-005: Hardcoded API Base URL Logic
- **Category:** Frontend
- **Location:** `src/services/api.ts` lines 9-16
- **Impact:** Potential CORS issues
- **Effort:** Low (1 day)
- **Fix:** Use environment variables consistently
- **Assigned:** [ ]
- **Status:** ⏳ Pending

### BUG-DB-003: JSON Fields Not Validated
- **Category:** Database
- **Location:** Tables with JSON columns
- **Impact:** Invalid JSON can be stored
- **Effort:** Low (Already done in backend)
- **Fix:** Already handled in application layer
- **Assigned:** [ ]
- **Status:** ⏳ Pending

### BUG-API-003: Missing HATEOAS Links
- **Category:** API
- **Location:** All responses
- **Impact:** Clients must hardcode URLs
- **Effort:** High (2 weeks)
- **Fix:** Add `_links` object to responses
- **Assigned:** [ ]
- **Status:** ⏳ Pending

### BUG-API-004: No Rate Limit Headers
- **Category:** API
- **Location:** Rate limiter middleware
- **Impact:** Clients can't see rate limit status
- **Effort:** Low (1 day)
- **Fix:** Add `X-RateLimit-*` headers
- **Assigned:** [ ]
- **Status:** ⏳ Pending

### BUG-RBAC-004: No Permission Granularity
- **Category:** RBAC
- **Location:** Authorization system
- **Impact:** Cannot grant specific permissions
- **Effort:** High (2-3 weeks)
- **Fix:** Implement ABAC (Attribute-Based Access Control)
- **Assigned:** [ ]
- **Status:** ⏳ Pending

### PERF-006: No CDN for Static Assets
- **Category:** Performance
- **Location:** Frontend deployment
- **Impact:** Slow page loads
- **Effort:** Low (2-3 days)
- **Fix:** Use CDN for static files
- **Assigned:** [ ]
- **Status:** ⏳ Pending

---

## 📈 Progress Tracking

### Week 1-2: Critical Issues (8 items)
- [ ] SEC-001: JWT Secret Management
- [ ] SEC-004: HTTPS Enforcement
- [ ] PERF-001: Connection Pooling
- [ ] BUG-DB-005: Automated Backups
- [ ] BUG-BE-001: Role Validation
- [ ] BUG-BE-004: CORS Configuration
- [ ] BUG-DB-006: PostgreSQL Migration Plan
- [ ] TEST-001: Unit Tests Setup

**Target:** 8/8 completed (100%)

### Week 3-4: High Priority (15 items)
**Target:** 10/15 completed (67%)

### Month 2: Medium Priority (18 items)
**Target:** 12/18 completed (67%)

### Month 3: Low Priority (7 items)
**Target:** 5/7 completed (71%)

---

## 📊 Effort Estimation

| Effort Level | Count | Total Days |
|--------------|-------|------------|
| Low (1-3 days) | 22 | 44 days |
| Medium (1 week) | 18 | 90 days |
| High (2+ weeks) | 8 | 96 days |
| **Total** | **48** | **230 days** |

**With 3-4 developers:** ~60-80 working days (~3 months)

---

## 🎯 Sprint Planning

### Sprint 1 (Week 1-2): Critical Fixes
**Goal:** Fix all critical security and performance issues

**Stories:**
1. Implement automated database backups
2. Fix database connection pooling
3. Enforce HTTPS in production
4. Implement JWT secret management
5. Add role validation to routes
6. Fix CORS configuration
7. Set up unit testing framework
8. Create PostgreSQL migration plan

**Definition of Done:**
- All critical issues resolved
- System can handle 100 concurrent users
- Basic test coverage (20%)

### Sprint 2 (Week 3-4): Testing & Security
**Goal:** Build testing infrastructure and harden security

**Stories:**
1. Write unit tests for core functions
2. Write API integration tests
3. Set up CI/CD pipeline
4. Implement password complexity
5. Add account lockout mechanism
6. Fix file upload validation
7. Resolve N+1 query issues
8. Implement response caching

**Definition of Done:**
- 50% test coverage
- CI/CD pipeline running
- All high-priority security issues fixed

### Sprint 3 (Week 5-6): Performance & API
**Goal:** Optimize performance and standardize API

**Stories:**
1. Standardize API response formats
2. Implement API versioning
3. Optimize database queries
4. Add image optimization
5. Implement soft deletes
6. Add missing database indexes
7. Fix date format inconsistencies
8. Centralize permission checks

**Definition of Done:**
- API response time < 200ms
- Consistent API format
- Database queries optimized

---

## 📝 Notes

### Testing Strategy
- **Unit Tests:** Jest + React Testing Library
- **Integration Tests:** Supertest
- **E2E Tests:** Playwright
- **Coverage Target:** 70%

### Deployment Strategy
- **Phase 1:** Limited Beta (50-100 users)
- **Phase 2:** Staging (500 users)
- **Phase 3:** Production (unlimited)

### Monitoring
- **APM:** New Relic or DataDog
- **Logging:** ELK Stack
- **Alerting:** PagerDuty

---

**Last Updated:** 2026-01-08  
**Next Review:** Weekly Sprint Review  
**Owner:** Development Team Lead
