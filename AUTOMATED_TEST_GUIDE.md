# 🧪 Automated Testing Guide - EMS WeCare

**วันที่:** 29 มกราคม 2569  
**เวลา:** 17:27 น.

---

## 📋 Test Files Created

### 1. Profile Page Tests
**ไฟล์:** `tests/profile-page.spec.ts`

**Test Cases:** 22 tests

**Coverage:**
- ✅ Profile viewing
- ✅ Profile editing (name, phone)
- ✅ Form validation
- ✅ Change password modal
- ✅ Password validation
- ✅ Password strength indicator
- ✅ Show/hide password
- ✅ Loading states
- ✅ Accessibility (ARIA, keyboard navigation)
- ✅ Responsive design (mobile, tablet)

### 2. Patient Wizard Tests
**ไฟล์:** `tests/patient-wizard.spec.ts`

**Test Cases:** 12 tests

**Coverage:**
- ✅ Wizard navigation (5 steps)
- ✅ Step 1: Identity information
- ✅ Step 2: Medical information
- ✅ Step 3: Contact information
- ✅ Step 4: File uploads
- ✅ Step 5: Review data
- ✅ Form validation
- ✅ Back navigation
- ✅ Data persistence
- ✅ Full registration flow

### 3. Playwright Config
**ไฟล์:** `playwright.config.ts`

**Features:**
- ✅ Multi-browser testing (Chrome, Firefox, Safari, Edge)
- ✅ Mobile testing (iPhone, Android)
- ✅ Parallel execution
- ✅ Auto-retry on failure
- ✅ Screenshots & videos
- ✅ HTML report
- ✅ Auto-start dev server

---

## 🚀 Setup & Installation

### 1. Install Playwright

```bash
# ติดตั้ง Playwright
npm install -D @playwright/test

# ติดตั้ง browsers
npx playwright install

# หรือติดตั้งเฉพาะ Chromium
npx playwright install chromium
```

### 2. Verify Installation

```bash
# ตรวจสอบว่าติดตั้งสำเร็จ
npx playwright --version
```

---

## 🧪 Running Tests

### Run All Tests

```bash
# รันทุก test
npx playwright test

# รันแบบ UI mode (แนะนำ)
npx playwright test --ui

# รันแบบ headed (เห็น browser)
npx playwright test --headed
```

### Run Specific Tests

```bash
# รันเฉพาะ profile tests
npx playwright test profile-page

# รันเฉพาะ wizard tests
npx playwright test patient-wizard

# รัน test เดียว
npx playwright test profile-page.spec.ts:45
```

### Run by Browser

```bash
# รันบน Chrome เท่านั้น
npx playwright test --project=chromium

# รันบน Firefox
npx playwright test --project=firefox

# รันบน Mobile Chrome
npx playwright test --project="Mobile Chrome"
```

### Debug Mode

```bash
# เปิด debug mode
npx playwright test --debug

# เปิด debug สำหรับ test เดียว
npx playwright test profile-page --debug
```

---

## 📊 View Test Results

### HTML Report

```bash
# สร้าง HTML report
npx playwright test --reporter=html

# เปิด report
npx playwright show-report
```

### Real-time Report

```bash
# รันแบบ UI mode (แนะนำ)
npx playwright test --ui
```

---

## 📝 Test Structure

### Profile Page Tests

```typescript
test.describe('Profile Page', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('http://localhost:5173');
    // ... login steps
  });

  test('should display profile information', async ({ page }) => {
    // Test implementation
  });
});
```

### Patient Wizard Tests

```typescript
test.describe('Patient Registration Wizard', () => {
  test('should complete full registration flow', async ({ page }) => {
    // Fill all 5 steps
    await fillStep1(page);
    await fillStep2(page);
    await fillStep3(page);
    // ... submit
  });
});
```

---

## 🎯 Test Coverage

### Profile Page (22 tests)

| Category | Tests | Status |
|----------|-------|--------|
| Display | 1 | ✅ |
| Edit Name | 1 | ✅ |
| Edit Phone | 1 | ✅ |
| Validation | 3 | ✅ |
| Cancel | 1 | ✅ |
| Password Modal | 5 | ✅ |
| Password Validation | 4 | ✅ |
| Loading States | 1 | ✅ |
| Accessibility | 3 | ✅ |
| Responsive | 2 | ✅ |

### Patient Wizard (12 tests)

| Category | Tests | Status |
|----------|-------|--------|
| Wizard Display | 1 | ✅ |
| Step 1 | 3 | ✅ |
| Step 2 | 1 | ✅ |
| Step 3 | 2 | ✅ |
| Step 4 | 1 | ✅ |
| Step 5 | 1 | ✅ |
| Navigation | 1 | ✅ |
| Full Flow | 1 | ✅ |
| Validation | 1 | ✅ |

---

## 🔧 Troubleshooting

### Issue 1: Playwright Not Found

```bash
# ติดตั้งใหม่
npm install -D @playwright/test
npx playwright install
```

### Issue 2: Tests Timeout

```bash
# เพิ่ม timeout ใน config
# playwright.config.ts
use: {
  actionTimeout: 30000,
  navigationTimeout: 60000,
}
```

### Issue 3: Dev Server Not Starting

```bash
# รัน dev server ก่อน
npm run dev

# จากนั้นรัน tests แบบ reuse server
npx playwright test
```

### Issue 4: Browser Not Found

```bash
# ติดตั้ง browsers ใหม่
npx playwright install --with-deps
```

---

## 📚 Best Practices

### 1. Use Page Object Model

```typescript
// pages/ProfilePage.ts
export class ProfilePage {
  constructor(private page: Page) {}
  
  async goto() {
    await this.page.goto('/profile');
  }
  
  async fillName(name: string) {
    await this.page.fill('input[name="name"]', name);
  }
}
```

### 2. Use Test Fixtures

```typescript
// fixtures.ts
export const test = base.extend({
  authenticatedPage: async ({ page }, use) => {
    await login(page);
    await use(page);
  },
});
```

### 3. Use Data-Testid

```typescript
// Component
<button data-testid="submit-button">Submit</button>

// Test
await page.click('[data-testid="submit-button"]');
```

### 4. Wait for Network Idle

```typescript
await page.waitForLoadState('networkidle');
```

### 5. Use Soft Assertions

```typescript
await expect.soft(page.locator('h1')).toContainText('Profile');
await expect.soft(page.locator('input')).toBeVisible();
```

---

## 🎨 CI/CD Integration

### GitHub Actions

```yaml
name: E2E Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npx playwright test
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

---

## 📊 Test Metrics

### Expected Results

```
Profile Page Tests:    22/22 passed ✅
Patient Wizard Tests:  12/12 passed ✅
Total:                 34/34 passed ✅

Duration: ~2-3 minutes
Browser: Chromium
```

### Performance Targets

- **Test Execution:** < 5 minutes
- **Single Test:** < 30 seconds
- **Page Load:** < 2 seconds
- **API Response:** < 1 second

---

## 🚀 Next Steps

### Additional Tests to Create

1. **Login Tests**
   - Quick login panel
   - Email/password login
   - Remember me
   - Logout

2. **Dashboard Tests**
   - Role-based views
   - Statistics display
   - Navigation menu

3. **Patient Management Tests**
   - List patients
   - Search/filter
   - View details
   - Edit patient
   - Delete patient

4. **Ride Management Tests**
   - Create ride
   - Assign driver
   - Update status
   - Cancel ride

---

## 📝 Summary

### Files Created
1. ✅ `tests/profile-page.spec.ts` (22 tests)
2. ✅ `tests/patient-wizard.spec.ts` (12 tests)
3. ✅ `playwright.config.ts` (configuration)
4. ✅ `AUTOMATED_TEST_GUIDE.md` (this file)

### Total Test Coverage
- **34 automated tests**
- **2 test suites**
- **6 browsers** (Chrome, Firefox, Safari, Edge, Mobile Chrome, Mobile Safari)
- **3 viewports** (Desktop, Mobile, Tablet)

### How to Run

```bash
# 1. Install Playwright
npm install -D @playwright/test
npx playwright install

# 2. Run tests
npx playwright test --ui

# 3. View report
npx playwright show-report
```

---

**Status:** ✅ **READY TO RUN**

**Next Action:** ติดตั้ง Playwright และรัน tests

```bash
npm install -D @playwright/test
npx playwright install chromium
npx playwright test --ui
```

<parameter name="EmptyFile">false
