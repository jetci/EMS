/**
 * Playwright E2E Tests - Patient Management
 * End-to-end testing for patient CRUD operations
 */

import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:5173';

test.describe('Patient Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[name="email"]', 'community@test.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    // Wait for navigation to dashboard
    await page.waitForURL('**/dashboard');
  });

  test('should display patients list', async ({ page }) => {
    // Navigate to patients page
    await page.click('text=ผู้ป่วย');
    await page.waitForURL('**/patients');

    // Check page title
    await expect(page.locator('h1')).toContainText('รายชื่อผู้ป่วย');

    // Check table exists
    await expect(page.locator('table')).toBeVisible();

    // Check at least one patient row
    const rows = page.locator('tbody tr');
    await expect(rows).toHaveCount({ minimum: 1 });
  });

  test('should create new patient', async ({ page }) => {
    // Navigate to create patient page
    await page.goto(`${BASE_URL}/patients/create`);

    // Fill form
    await page.fill('input[name="fullName"]', 'ทดสอบ E2E');
    await page.fill('input[name="nationalId"]', '1234567890123');
    await page.fill('input[name="dob"]', '1950-01-01');
    await page.fill('input[name="age"]', '74');
    await page.selectOption('select[name="gender"]', 'ชาย');
    await page.fill('input[name="contactPhone"]', '0812345678');

    // Submit form
    await page.click('button[type="submit"]');

    // Wait for success message
    await expect(page.locator('text=สร้างผู้ป่วยสำเร็จ')).toBeVisible({ timeout: 5000 });

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

    // Wait for success
    await expect(page.locator('text=แก้ไขข้อมูลสำเร็จ')).toBeVisible({ timeout: 5000 });

    // Verify updated name
    await expect(page.locator('text=ทดสอบ E2E (แก้ไข)')).toBeVisible();
  });

  test('should delete patient', async ({ page }) => {
    // Go to patients list
    await page.goto(`${BASE_URL}/patients`);

    // Get patient name before delete
    const patientName = await page.locator('tbody tr:last-child td:nth-child(2)').textContent();

    // Click delete button
    await page.click('tbody tr:last-child button:has-text("ลบ")');

    // Confirm deletion
    await page.click('button:has-text("ยืนยัน")');

    // Wait for success
    await expect(page.locator('text=ลบผู้ป่วยสำเร็จ')).toBeVisible({ timeout: 5000 });

    // Verify patient is removed
    await expect(page.locator(`text=${patientName}`)).not.toBeVisible();
  });

  test('should validate required fields', async ({ page }) => {
    // Navigate to create patient page
    await page.goto(`${BASE_URL}/patients/create`);

    // Submit without filling required fields
    await page.click('button[type="submit"]');

    // Check validation errors
    await expect(page.locator('text=กรุณากรอกชื่อ-นามสกุล')).toBeVisible();
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

    // Check pagination exists
    await expect(page.locator('nav[aria-label="pagination"]')).toBeVisible();

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
    await page.goto(`${BASE_URL}/patients/create`);

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
