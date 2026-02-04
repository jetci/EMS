---
description: Bug Resolution Workflow - แนวทางการวิเคราะห์และแก้ไขบัคอย่างเป็นระบบ
---

# 🔄 Bug Resolution Workflow

**Version:** 1.0  
**Last Updated:** 2026-01-07  
**Applicable to:** EMS WeCare System

---

## 📋 Overview

Workflow นี้ใช้สำหรับการวิเคราะห์และแก้ไขบัคอย่างเป็นระบบ โดยเน้น:
- ✅ **One-by-One Approach** - แก้ทีละปัญหา
- ✅ **Iterative Process** - วนซ้ำจนกว่าจะผ่าน
- ✅ **Test-Driven** - ทดสอบทุกครั้งก่อนไปต่อ
- ✅ **Documentation** - บันทึกทุกขั้นตอน

---

## 🔧 ขั้นตอนการทำงานต่อ 1 ปัญหา

### Step 1: 🔍 วิเคราะห์ปัญหา
**คำถามที่ต้องตอบ:**
- เกิดอะไรขึ้น? (What)
- ทำไมถึงเกิด? (Why)
- ส่งผลกระทบอย่างไร? (Impact)
- ใครได้รับผลกระทบ? (Who)
- เกิดเมื่อไหร่? (When)

**Output:**
```markdown
### 🐛 ปัญหาที่พบ: [BUG-XXX: ชื่อปัญหา]

**Priority:** 🔴 Critical / 🟠 High / 🟡 Medium / 🟢 Low

**Description:**
- รายละเอียด: ...
- สาเหตุที่คาดว่าเป็น: ...
- บทบาทผู้ใช้ที่ได้รับผลกระทบ: ...
- ความรุนแรง: ...

**Reproduction Steps:**
1. ...
2. ...
3. ...

**Expected Behavior:** ...
**Actual Behavior:** ...
```

---

### Step 2: 🛠️ เสนอแนวทางแก้ไข
**คำถามที่ต้องตอบ:**
- แก้ไขอย่างไร? (How)
- ไฟล์ไหนที่ต้องแก้? (Where)
- มี side effects ไหม? (Risk)
- มี alternative solutions ไหม? (Options)

**Output:**
```markdown
### 🛠 แนวทางแก้ไข:

**Root Cause:**
- ...

**Solution:**
- ไฟล์ที่ต้องแก้: `path/to/file.ts`
- การเปลี่ยนแปลง:
  ```typescript
  // Before
  const result = oldCode();
  
  // After
  const result = newCode();
  ```

**Alternative Solutions:**
1. Option A: ...
2. Option B: ...

**Chosen Solution:** Option A
**Reason:** ...

**Side Effects / Breaking Changes:**
- None / [List changes]
```

---

### Step 3: 🧪 เขียน Test Script
**คำถามที่ต้องตอบ:**
- ทดสอบอะไร? (What to test)
- ทดสอบอย่างไร? (How to test)
- ใช้เครื่องมืออะไร? (Tools)
- Expected result คืออะไร? (Assertion)

**Output:**
```markdown
### 🧪 Test Script:

**Test Type:** Unit / Integration / E2E
**Tool:** Jest / Cypress / Postman / Manual
**Test File:** `path/to/test.spec.ts`

**Test Cases:**

#### Test Case 1: [ชื่อ test case]
```typescript
describe('BUG-XXX Fix', () => {
  it('should [expected behavior]', () => {
    // Arrange
    const input = ...;
    
    // Act
    const result = functionUnderTest(input);
    
    // Assert
    expect(result).toBe(expectedValue);
  });
});
```

#### Test Case 2: Edge Cases
```typescript
it('should handle edge case', () => {
  // ...
});
```

**Manual Test Steps:**
1. Navigate to ...
2. Click ...
3. Verify ...
```

---

### Step 4: 🚦 ทดสอบการแก้ไข
**คำถามที่ต้องตอบ:**
- ผ่านการทดสอบหรือไม่? (Pass/Fail)
- ถ้าไม่ผ่าน ทำไม? (Why failed)
- ต้องแก้ไขอะไรเพิ่ม? (Next action)

**Output:**
```markdown
### ✅ ผลการทดสอบ:

**Test Run Date:** 2026-01-07 22:56:23
**Environment:** Development / Staging / Production

#### Automated Tests:
- ✅ Unit Tests: 5/5 passed
- ✅ Integration Tests: 3/3 passed
- ❌ E2E Tests: 1/2 passed (1 failed)

#### Manual Tests:
- ✅ Test Case 1: Login as Admin → Success
- ✅ Test Case 2: Create Patient → Success
- ❌ Test Case 3: Assign Driver → Failed

**Failed Test Details:**
```
Error: Driver assignment failed
Expected: Driver ID assigned
Actual: null
```

**Decision:**
- [✅ PASS] → ไปยังบัคถัดไป
- [❌ FAIL] → วิเคราะห์ใหม่และแก้ไขซ้ำ (กลับไป Step 2)

**If FAIL, Next Actions:**
1. วิเคราะห์ error message
2. ปรับแก้โค้ด
3. Run tests อีกครั้ง
```

---

## 🔁 Iteration Loop

```
┌─────────────────────────────────────────┐
│  1. วิเคราะห์ปัญหา                      │
└────────────┬────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│  2. เสนอแนวทางแก้ไข                     │
└────────────┬────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│  3. เขียน Test Script                   │
└────────────┬────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│  4. ทดสอบการแก้ไข                       │
└────────────┬────────────────────────────┘
             │
        ┌────┴────┐
        │         │
        ▼         ▼
      ✅ PASS   ❌ FAIL
        │         │
        │         └──────┐
        │                │
        ▼                ▼
   Next Bug      กลับไป Step 2
                 (Iterate)
```

---

## 📊 Bug Priority Matrix

| Priority | Severity | Impact | Timeline |
|----------|----------|--------|----------|
| 🔴 **Critical** | System down, data loss | All users | Fix immediately |
| 🟠 **High** | Major feature broken | Many users | Fix within 24h |
| 🟡 **Medium** | Minor feature issue | Some users | Fix within 1 week |
| 🟢 **Low** | Cosmetic, enhancement | Few users | Fix when available |

---

## 📝 Documentation Checklist

สำหรับแต่ละบัคที่แก้ไขเสร็จ ต้องมี:

- [ ] Bug report (Step 1)
- [ ] Solution documentation (Step 2)
- [ ] Test cases (Step 3)
- [ ] Test results (Step 4)
- [ ] Code changes committed
- [ ] Update CHANGELOG.md
- [ ] Update related documentation
- [ ] Notify stakeholders

---

## 🎯 Best Practices

### DO ✅
- แก้ทีละบัค อย่าแก้หลายบัคพร้อมกัน
- เขียน test ก่อนแก้ไข (TDD approach)
- Document ทุกขั้นตอน
- Review code ก่อน commit
- Test ใน environment ที่ใกล้เคียง production

### DON'T ❌
- อย่าข้าม test step
- อย่า assume ว่าแก้ไขถูกต้องโดยไม่ทดสอบ
- อย่าแก้หลายบัคในครั้งเดียว
- อย่า commit โค้ดที่ยัง test ไม่ผ่าน
- อย่าลืม document

---

## 🛠️ Tools & Resources

### Testing Tools:
- **Unit Tests:** Jest, Mocha, Vitest
- **Integration Tests:** Supertest, Testing Library
- **E2E Tests:** Cypress, Playwright, Selenium
- **API Tests:** Postman, Insomnia, curl

### Documentation:
- **Bug Tracking:** GitHub Issues, Jira, Linear
- **Test Reports:** Jest HTML Reporter, Allure
- **Code Review:** GitHub PR, GitLab MR

---

## 📎 Templates

### Bug Report Template:
```markdown
# BUG-XXX: [Title]

## Priority: [🔴/🟠/🟡/🟢]

## Description
[What happened]

## Steps to Reproduce
1. ...
2. ...

## Expected vs Actual
- Expected: ...
- Actual: ...

## Environment
- OS: ...
- Browser: ...
- Version: ...

## Screenshots/Logs
[Attach if available]
```

### Test Case Template:
```typescript
describe('BUG-XXX: [Title]', () => {
  beforeEach(() => {
    // Setup
  });

  it('should [expected behavior]', () => {
    // Arrange
    // Act
    // Assert
  });

  afterEach(() => {
    // Cleanup
  });
});
```

---

## 🎓 Example Usage

See: `BUG-001-FIXED-MIXED-DATABASE-ACCESS.md` for a complete example.

---

**Created by:** System QA Analyst  
**Date:** 2026-01-07  
**Version:** 1.0
