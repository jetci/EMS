# 🐛 BUG-002: Field Name Mismatch (camelCase vs snake_case)

**Status:** 🔄 IN PROGRESS  
**Priority:** 🔴 CRITICAL  
**Assigned to:** System QA Analyst  
**Date Created:** 2026-01-07  
**Last Updated:** 2026-01-07

---

## Step 1: 🔍 วิเคราะห์ปัญหา

### ปัญหาที่พบ:

**Description:**
Frontend ใช้ `camelCase` (เช่น `patientId`, `fullName`) แต่ Backend/Database return `snake_case` (เช่น `patient_id`, `full_name`) ทำให้ต้องมี workaround code ที่ handle ทั้ง 2 formats

**Root Cause:**
- Frontend TypeScript interfaces ใช้ camelCase convention
- Backend SQLite database ใช้ snake_case convention
- ไม่มี automatic transformation layer

**Affected Roles:**
- 🔴 All users (ทุกบทบาท)
- ส่งผลกระทบต่อทุก API calls

**Severity:** CRITICAL

**Reproduction Steps:**
1. Login as any user
2. Navigate to Patient Detail page
3. Open browser console
4. Observe API response: `{ patient_id: "PAT-001", full_name: "John Doe" }`
5. Frontend code must handle both: `r.patientId === patientId || r.patient_id === patientId`

**Expected Behavior:**
- API should return consistent field names
- Frontend should not need to check both formats

**Actual Behavior:**
- API returns snake_case
- Frontend expects camelCase
- Code has workarounds everywhere

**Evidence:**
```typescript
// PatientDetailPage.tsx line 44-45
const patientRides = (Array.isArray(allRides) ? allRides : (allRides.rides || []))
    .filter((r: any) => r.patientId === patientId || r.patient_id === patientId)
    //                   ^^^^^^^^^^                    ^^^^^^^^^^^^^^
    //                   camelCase                     snake_case
```

---

## Step 2: 🛠️ เสนอแนวทางแก้ไข

### Root Cause Analysis:

**Why it happened:**
1. Database schema uses snake_case (SQL convention)
2. TypeScript uses camelCase (JavaScript convention)
3. No transformation layer between DB and API response

### Solution Options:

#### **Option A: Backend Transform to camelCase** ⭐ RECOMMENDED
**Pros:**
- ✅ Frontend ไม่ต้องเปลี่ยน
- ✅ API response เป็น standard JavaScript convention
- ✅ Better developer experience

**Cons:**
- ❌ ต้องเขียน transformation function
- ❌ Slight performance overhead

**Implementation:**
```typescript
// utils/caseConverter.ts
export const snakeToCamel = (obj: any): any => {
  if (Array.isArray(obj)) {
    return obj.map(snakeToCamel);
  }
  if (obj !== null && typeof obj === 'object') {
    return Object.keys(obj).reduce((acc, key) => {
      const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
      acc[camelKey] = snakeToCamel(obj[key]);
      return acc;
    }, {} as any);
  }
  return obj;
};

// Apply in routes
router.get('/patients/:id', async (req, res) => {
  const patient = sqliteDB.get('SELECT * FROM patients WHERE id = ?', [id]);
  res.json(snakeToCamel(patient)); // Transform before sending
});
```

#### **Option B: Frontend Accept snake_case**
**Pros:**
- ✅ No backend changes needed

**Cons:**
- ❌ ต้องเปลี่ยน TypeScript interfaces ทั้งหมด
- ❌ ไม่เป็น JavaScript convention
- ❌ Breaking change สำหรับ frontend

#### **Option C: Use GraphQL with Field Resolvers**
**Pros:**
- ✅ Automatic field name transformation
- ✅ Type-safe

**Cons:**
- ❌ Major architecture change
- ❌ Overkill for this project

### Chosen Solution: **Option A**

**Reason:**
- Minimal breaking changes
- Follows JavaScript best practices
- Better DX (Developer Experience)
- Can be implemented incrementally

### Files to Modify:

1. `wecare-backend/src/utils/caseConverter.ts` (NEW)
2. `wecare-backend/src/routes/patients.ts`
3. `wecare-backend/src/routes/rides.ts`
4. `wecare-backend/src/routes/drivers.ts`
5. All other route files

### Side Effects / Breaking Changes:

**Breaking Changes:** None (additive change)
**Migration Required:** No
**Backward Compatible:** Yes (can support both formats during transition)

---

## Step 3: 🧪 เขียน Test Script

### Test Type: **Integration Tests**
### Tool: **Jest + Supertest**
### Test File: `wecare-backend/tests/api/case-conversion.spec.ts`

### Test Cases:

#### Test Case 1: Patient API Returns camelCase
```typescript
import request from 'supertest';
import app from '../../src/index';

describe('BUG-002: Field Name Consistency', () => {
  let authToken: string;

  beforeAll(async () => {
    // Login to get token
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@wecare.dev', password: 'password' });
    authToken = res.body.token;
  });

  describe('GET /api/patients/:id', () => {
    it('should return patient data in camelCase format', async () => {
      const res = await request(app)
        .get('/api/patients/PAT-001')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      // Assert camelCase fields exist
      expect(res.body).toHaveProperty('fullName');
      expect(res.body).toHaveProperty('nationalId');
      expect(res.body).toHaveProperty('contactPhone');
      expect(res.body).toHaveProperty('currentAddress');
      
      // Assert snake_case fields DO NOT exist
      expect(res.body).not.toHaveProperty('full_name');
      expect(res.body).not.toHaveProperty('national_id');
      expect(res.body).not.toHaveProperty('contact_phone');
    });

    it('should handle nested objects correctly', async () => {
      const res = await request(app)
        .get('/api/patients/PAT-001')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      // Check nested address object
      expect(res.body.currentAddress).toHaveProperty('houseNumber');
      expect(res.body.currentAddress).toHaveProperty('village');
      expect(res.body.currentAddress).not.toHaveProperty('house_number');
    });
  });

  describe('GET /api/rides', () => {
    it('should return rides in camelCase format', async () => {
      const res = await request(app)
        .get('/api/rides')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const ride = res.body.data[0];
      expect(ride).toHaveProperty('patientId');
      expect(ride).toHaveProperty('patientName');
      expect(ride).toHaveProperty('appointmentTime');
      expect(ride).not.toHaveProperty('patient_id');
    });
  });

  describe('POST /api/patients', () => {
    it('should accept camelCase input and return camelCase output', async () => {
      const newPatient = {
        fullName: 'Test Patient',
        nationalId: '1234567890123',
        contactPhone: '0812345678',
        currentAddress: {
          houseNumber: '123',
          village: 'Test Village'
        }
      };

      const res = await request(app)
        .post('/api/patients')
        .set('Authorization', `Bearer ${authToken}`)
        .send(newPatient)
        .expect(201);

      expect(res.body).toHaveProperty('fullName', 'Test Patient');
      expect(res.body).not.toHaveProperty('full_name');
    });
  });
});
```

#### Test Case 2: Edge Cases
```typescript
describe('Edge Cases', () => {
  it('should handle null values', async () => {
    const res = await request(app)
      .get('/api/patients/PAT-001')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    // Null values should remain null
    expect(res.body.profileImageUrl).toBeNull();
  });

  it('should handle arrays correctly', async () => {
    const res = await request(app)
      .get('/api/patients')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(Array.isArray(res.body.data)).toBe(true);
    res.body.data.forEach((patient: any) => {
      expect(patient).toHaveProperty('fullName');
    });
  });

  it('should handle JSON fields (patientTypes, chronicDiseases)', async () => {
    const res = await request(app)
      .get('/api/patients/PAT-001')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(Array.isArray(res.body.patientTypes)).toBe(true);
    expect(Array.isArray(res.body.chronicDiseases)).toBe(true);
  });
});
```

### Manual Test Steps:

1. **Start backend server**
   ```bash
   cd wecare-backend
   npm run dev
   ```

2. **Test Patient API**
   ```bash
   # Login
   curl -X POST http://localhost:3001/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"admin@wecare.dev","password":"password"}' \
     > token.json

   # Get patient (check response format)
   curl http://localhost:3001/api/patients/PAT-001 \
     -H "Authorization: Bearer $(cat token.json | jq -r .token)" \
     | jq .
   ```

3. **Verify Response Format**
   - ✅ Should see: `fullName`, `contactPhone`, `currentAddress`
   - ❌ Should NOT see: `full_name`, `contact_phone`, `current_address`

4. **Test Frontend**
   - Open browser → Login → Navigate to Patient Detail
   - Open DevTools → Network tab
   - Verify API responses use camelCase
   - Verify no console errors

---

## Step 4: 🚦 ทดสอบการแก้ไข

### Test Run Date: **[PENDING]**
### Environment: **Development**

### Automated Tests:
- [ ] Unit Tests: 0/0 passed (N/A)
- [ ] Integration Tests: 0/15 passed (NOT RUN YET)
- [ ] E2E Tests: 0/0 passed (N/A)

### Manual Tests:
- [ ] Test Case 1: Patient API camelCase → NOT TESTED
- [ ] Test Case 2: Rides API camelCase → NOT TESTED
- [ ] Test Case 3: Frontend compatibility → NOT TESTED

### Implementation Status:

**Current Status:** 🔄 READY TO IMPLEMENT

**Next Actions:**
1. ✅ Create `caseConverter.ts` utility
2. ⏳ Update `patients.ts` route
3. ⏳ Update `rides.ts` route
4. ⏳ Update other routes
5. ⏳ Run integration tests
6. ⏳ Manual testing
7. ⏳ Frontend verification

---

## 📊 Implementation Plan

### Phase 1: Create Utility (30 min)
- [ ] Create `wecare-backend/src/utils/caseConverter.ts`
- [ ] Write unit tests for converter
- [ ] Test with sample data

### Phase 2: Update Routes (2 hours)
- [ ] Update `patients.ts` (30 min)
- [ ] Update `rides.ts` (30 min)
- [ ] Update `drivers.ts` (20 min)
- [ ] Update other routes (40 min)

### Phase 3: Testing (1 hour)
- [ ] Write integration tests (30 min)
- [ ] Run all tests (10 min)
- [ ] Manual testing (20 min)

### Phase 4: Verification (30 min)
- [ ] Test all user roles
- [ ] Verify frontend works
- [ ] Check for regressions

**Total Estimated Time:** 4 hours

---

## 🎯 Success Criteria

- [ ] All API responses use camelCase
- [ ] No snake_case fields in responses
- [ ] Frontend code simplified (remove dual-format checks)
- [ ] All integration tests pass
- [ ] No breaking changes
- [ ] Performance impact < 5ms per request

---

## 📝 Notes

- This is a **critical** bug affecting all API consumers
- Should be fixed before adding new features
- Consider adding ESLint rule to prevent snake_case in API responses
- Document the convention in API documentation

---

**Created by:** System QA Analyst  
**Date:** 2026-01-07  
**Status:** 🔄 Ready to Implement  
**Follows:** BUG_RESOLUTION_WORKFLOW.md
