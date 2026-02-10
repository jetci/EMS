/**
 * Playwright E2E Tests - Patient Management
 * End-to-end testing for patient CRUD operations
 */

import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:5174';

test.describe('Patient Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test (match current UI)
    await page.goto(`${BASE_URL}`);
    await page.waitForLoadState('networkidle');
    await page.click('text=เข้าสู่ระบบ');
    await page.fill('input[name="email"]', 'community1@wecare.dev');
    await page.fill('input[name="password"]', 'password');
    await page.click('button[type="submit"]');
    
    // Wait for navigation to dashboard
    await page.waitForURL('**/dashboard');
  });

  test('should display patients list', async ({ page }) => {
    // Navigate to patients page
    await page.goto(`${BASE_URL}/patients`);
    await page.waitForLoadState('networkidle');

    // Check page title
    await expect(page.locator('h1')).toContainText('จัดการข้อมูลผู้ป่วย');

    // Check table exists with proper aria-label
    await expect(page.getByRole('table', { name: 'รายชื่อผู้ป่วย' })).toBeVisible();

    // Check at least one patient row
    const rows = page.locator('tbody tr');
    await expect(rows).toHaveCount({ minimum: 1 });
  });

  test('should create new patient', async ({ page }) => {
    // Navigate to patients page and open registration wizard
    await page.goto(`${BASE_URL}/patients`);
    await page.click('text=ลงทะเบียนผู้ป่วยใหม่');
    await page.waitForURL('**/patients/register');

    // Step 1: Fill identity info
    await page.selectOption('select[name="title"]', 'นาย');
    await page.fill('input[name="fullName"]', 'ทดสอบ E2E');
    await page.fill('input[name="nationalId"]', '1234567890123');
    await page.fill('input[name="dob"]', '1950-01-01');
    await page.selectOption('select[name="gender"]', 'ชาย');
    await page.click('button:has-text("ถัดไป")');

    // Step 2: Minimal medical info (if required)
    await page.selectOption('select[name="bloodType"]', 'A');
    await page.selectOption('select[name="rhFactor"]', '+');
    await page.selectOption('select[name="healthCoverage"]', 'บัตรทอง');
    await page.click('button:has-text("ถัดไป")');

    // Step 3: Contact info
    await page.fill('input[name="contactPhone"]', '0812345678');
    await page.click('button:has-text("ถัดไป")');

    // Step 4: Skip uploads
    await page.click('button:has-text("ถัดไป")');

    // Step 5: Submit
    const dialogPromise = new Promise<void>((resolve) => {
      page.once('dialog', async (dialog) => {
        expect(dialog.message()).toContain('ลงทะเบียนผู้ป่วยสำเร็จ');
        await dialog.accept();
        resolve();
      });
    });
    await page.click('button:has-text("ยืนยัน"), button:has-text("เสร็จสิ้น")');
    await dialogPromise;

    // Should redirect to patients list
    await page.waitForURL('**/patients');

    // Verify new patient appears in list
    await expect(page.locator('text=ทดสอบ E2E')).toBeVisible();
  });

  test('should view patient details', async ({ page }) => {
    // Go to patients list
    await page.goto(`${BASE_URL}/patients`);

    // Click first patient
    await page.click('tbody tr:first-child td:first-child a');

    // Wait for details page
    await page.waitForURL('**/patients/*');

    // Check patient details are displayed
    await expect(page.locator('text=ข้อมูลผู้ป่วย')).toBeVisible();
    await expect(page.locator('text=ชื่อ-นามสกุล')).toBeVisible();
    await expect(page.locator('text=เลขบัตรประชาชน')).toBeVisible();
  });

  test('should edit patient', async ({ page }) => {
    // Go to patients list
    await page.goto(`${BASE_URL}/patients`);

    // Click edit button on first patient
    await page.click('tbody tr:first-child button:has-text("แก้ไข")');

    // Wait for edit page
    await page.waitForURL('**/patients/*/edit');

    // Update name
    await page.fill('input[name="fullName"]', 'ทดสอบ E2E (แก้ไข)');

    // Submit
    await page.click('button[type="submit"]');

    // Navigate back to list if not auto-redirected
    if (!/\/patients$/.test(page.url())) {
      await page.goto(`${BASE_URL}/patients`);
    }

    // Verify updated name in list
    await expect(page.locator('text=ทดสอบ E2E (แก้ไข)')).toBeVisible();
  });

  test('should delete patient', async ({ page }) => {
    // Go to patients list
    await page.goto(`${BASE_URL}/patients`);

    // Get patient name before delete
    const patientName = await page.locator('tbody tr:last-child td:nth-child(2)').textContent();

    // Accept native confirm dialog
    page.once('dialog', async (dialog) => {
      await dialog.accept();
    });

    // Click delete button
    await page.click('tbody tr:last-child button:has-text("ลบ")');

    // Wait for success toast
    await expect(page.locator('text=ลบผู้ป่วยสำเร็จ')).toBeVisible({ timeout: 5000 });

    // Verify patient is removed
    if (patientName) {
      await expect(page.locator(`text=${patientName}`)).not.toBeVisible();
    }
  });

  test('should validate required fields (registration wizard)', async ({ page }) => {
    // Navigate to patient registration page
    await page.goto(`${BASE_URL}/patients/register`);

    // Try to proceed without filling required fields
    await page.click('button:has-text("ถัดไป")');

    // Check validation errors appear
    await expect(page.locator('text=กรุณากรอก').or(page.locator('text=กรุณาเลือก'))).toBeVisible();
  });

  test('should search patients', async ({ page }) => {
    // Go to patients list
    await page.goto(`${BASE_URL}/patients`);

    // Type in search box
    await page.fill('input[placeholder*="ค้นหา"]', 'ทดสอบ');

    // Wait for filtered results
    await page.waitForTimeout(500);

    // Check results contain search term
    const rows = page.locator('tbody tr');
    const count = await rows.count();
    
    for (let i = 0; i < count; i++) {
      const text = await rows.nth(i).textContent();
      expect(text?.toLowerCase()).toContain('ทดสอบ');
    }
  });

  test('should paginate patients', async ({ page }) => {
    // Go to patients list
    await page.goto(`${BASE_URL}/patients`);

    // Check pagination exists (ARIA labels updated)
    await expect(page.getByRole('navigation', { name: 'การแบ่งหน้า' })).toBeVisible();

    // Click next page
    await page.click('button:has-text("ถัดไป")');

    // Wait for page change
    await page.waitForTimeout(500);

    // Verify URL changed
    expect(page.url()).toContain('page=2');
  });
});

test.describe('Patient Accessibility', () => {
  test('should be keyboard navigable', async ({ page }) => {
    await page.goto(`${BASE_URL}/patients`);

    // Tab through elements
    await page.keyboard.press('Tab'); // Skip to content
    await page.keyboard.press('Tab'); // Navigation
    await page.keyboard.press('Tab'); // First button

    // Check focus is visible
    const focused = await page.evaluate(() => document.activeElement?.tagName);
    expect(focused).toBeTruthy();
  });

  test('should have proper ARIA labels', async ({ page }) => {
    await page.goto(`${BASE_URL}/patients/register`);

    // Check form has labels
    const labels = await page.locator('label').count();
    expect(labels).toBeGreaterThan(0);

    // Check buttons have aria-label or text
    const buttons = await page.locator('button').all();
    for (const button of buttons) {
      const ariaLabel = await button.getAttribute('aria-label');
      const text = await button.textContent();
      expect(ariaLabel || text).toBeTruthy();
    }
  });
});
