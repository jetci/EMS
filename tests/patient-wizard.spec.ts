/**
 * E2E Tests for Patient Registration Wizard
 * Tests all 5 steps of the patient registration process
 */

import { test, expect } from '@playwright/test';

const TEST_USER = {
  email: 'community1@wecare.dev',
  password: 'password'
};

const TEST_PATIENT = {
  title: 'นาย',
  fullName: 'สมชาย ทดสอบระบบ',
  nationalId: '1234567890123',
  dob: '1990-01-15',
  gender: 'ชาย',
  bloodType: 'A',
  rhFactor: '+',
  healthCoverage: 'บัตรทอง',
  chronicDiseases: ['เบาหวาน', 'ความดันโลหิตสูง'],
  allergies: ['Penicillin', 'กุ้ง'],
  phone: '0812345678',
  address: {
    houseNumber: '123/45',
    village: 'หมู่ 5',
    tambon: 'ในเมือง',
    amphoe: 'เมือง',
    changwat: 'เชียงใหม่'
  },
  emergencyContact: {
    name: 'สมหญิง ทดสอบระบบ',
    phone: '0898765432',
    relation: 'ภรรยา'
  }
};

test.describe('Patient Registration Wizard', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('http://localhost:5174');
    await page.waitForLoadState('networkidle');
    await page.click('text=เข้าสู่ระบบ');
    await page.fill('input[name="email"]', TEST_USER.email);
    await page.fill('input[name="password"]', TEST_USER.password);
    await page.click('button[type="submit"]');
    await page.waitForURL(/.*dashboard/);
    
    // Navigate to patient registration
    await page.click('text=ลงทะเบียนผู้ป่วย');
    await page.waitForLoadState('networkidle');
  });

  test('should display wizard with 5 steps', async ({ page }) => {
    // Check page title
    await expect(page.locator('h1:has-text("ลงทะเบียนผู้ป่วย")')).toBeVisible();
    
    // Check progress indicator shows 5 steps
    const steps = page.locator('[class*="step"]').filter({ hasText: /ข้อมูล/ });
    await expect(steps).toHaveCount(5);
  });

  test('Step 1: should fill identity information', async ({ page }) => {
    // Check we're on step 1
    await expect(page.locator('text=ข้อมูลส่วนตัว')).toBeVisible();
    
    // Fill title
    await page.selectOption('select[name="title"]', TEST_PATIENT.title);
    
    // Fill full name
    await page.fill('input[name="fullName"]', TEST_PATIENT.fullName);
    
    // Fill national ID
    await page.fill('input[name="nationalId"]', TEST_PATIENT.nationalId);
    
    // Fill date of birth
    await page.fill('input[name="dob"]', TEST_PATIENT.dob);
    
    // Check age is auto-calculated
    const ageInput = page.locator('input[name="age"]');
    await expect(ageInput).not.toHaveValue('');
    
    // Select gender
    await page.selectOption('select[name="gender"]', TEST_PATIENT.gender);
    
    // Click next
    await page.click('button:has-text("ถัดไป")');
    
    // Check we moved to step 2
    await expect(page.locator('text=ข้อมูลทางการแพทย์')).toBeVisible();
  });

  test('Step 1: should validate required fields', async ({ page }) => {
    // Try to click next without filling
    await page.click('button:has-text("ถัดไป")');
    
    // Check error messages appear
    await expect(page.locator('text=กรุณากรอก').or(page.locator('text=กรุณาเลือก'))).toBeVisible();
  });

  test('Step 1: should validate national ID format', async ({ page }) => {
    // Fill invalid national ID (too short)
    await page.fill('input[name="nationalId"]', '123');
    
    // Blur field to trigger validation
    await page.locator('input[name="nationalId"]').blur();
    
    // Check error message
    await expect(page.locator('text=13 หลัก').or(page.locator('text=ไม่ถูกต้อง'))).toBeVisible();
  });

  test('Step 2: should fill medical information', async ({ page }) => {
    // Complete step 1 first
    await fillStep1(page);
    
    // Check we're on step 2
    await expect(page.locator('text=ข้อมูลทางการแพทย์')).toBeVisible();
    
    // Select blood type
    await page.selectOption('select[name="bloodType"]', TEST_PATIENT.bloodType);
    
    // Select RH factor
    await page.selectOption('select[name="rhFactor"]', TEST_PATIENT.rhFactor);
    
    // Select health coverage
    await page.selectOption('select[name="healthCoverage"]', TEST_PATIENT.healthCoverage);
    
    // Add chronic diseases
    for (const disease of TEST_PATIENT.chronicDiseases) {
      await page.fill('input[placeholder*="โรคประจำตัว"]', disease);
      await page.keyboard.press('Enter');
    }
    
    // Add allergies
    for (const allergy of TEST_PATIENT.allergies) {
      await page.fill('input[placeholder*="แพ้"]', allergy);
      await page.keyboard.press('Enter');
    }
    
    // Click next
    await page.click('button:has-text("ถัดไป")');
    
    // Check we moved to step 3
    await expect(page.locator('text=ข้อมูลติดต่อ')).toBeVisible();
  });

  test('Step 3: should fill contact information', async ({ page }) => {
    // Complete steps 1-2
    await fillStep1(page);
    await fillStep2(page);
    
    // Check we're on step 3
    await expect(page.locator('text=ข้อมูลติดต่อ')).toBeVisible();
    
    // Fill phone
    await page.fill('input[name="contactPhone"]', TEST_PATIENT.phone);
    
    // Fill address
    await page.fill('input[name="currentHouseNumber"]', TEST_PATIENT.address.houseNumber);
    await page.fill('input[name="currentVillage"]', TEST_PATIENT.address.village);
    await page.fill('input[name="currentTambon"]', TEST_PATIENT.address.tambon);
    await page.fill('input[name="currentAmphoe"]', TEST_PATIENT.address.amphoe);
    await page.fill('input[name="currentChangwat"]', TEST_PATIENT.address.changwat);
    
    // Fill emergency contact
    await page.fill('input[name="emergencyContactName"]', TEST_PATIENT.emergencyContact.name);
    await page.fill('input[name="emergencyContactPhone"]', TEST_PATIENT.emergencyContact.phone);
    await page.fill('input[name="emergencyContactRelation"]', TEST_PATIENT.emergencyContact.relation);
    
    // Click next
    await page.click('button:has-text("ถัดไป")');
    
    // Check we moved to step 4
    await expect(page.locator('text=เอกสารแนบ')).toBeVisible();
  });

  test('Step 3: should validate phone number', async ({ page }) => {
    // Complete steps 1-2
    await fillStep1(page);
    await fillStep2(page);
    
    // Fill invalid phone
    await page.fill('input[name="contactPhone"]', '123');
    
    // Try to proceed
    await page.click('button:has-text("ถัดไป")');
    
    // Check error message
    await expect(page.locator('text=9-10 หลัก').or(page.locator('text=ไม่ถูกต้อง'))).toBeVisible();
  });

  test('Step 4: should handle file uploads', async ({ page }) => {
    // Complete steps 1-3
    await fillStep1(page);
    await fillStep2(page);
    await fillStep3(page);
    
    // Check we're on step 4
    await expect(page.locator('text=เอกสารแนบ')).toBeVisible();
    
    // Skip file upload (optional)
    await page.click('button:has-text("ถัดไป")');
    
    // Check we moved to step 5
    await expect(page.locator('text=ตรวจสอบข้อมูล')).toBeVisible();
  });

  test('Step 5: should display review of all data', async ({ page }) => {
    // Complete all steps
    await fillStep1(page);
    await fillStep2(page);
    await fillStep3(page);
    await page.click('button:has-text("ถัดไป")'); // Skip step 4
    
    // Check we're on step 5
    await expect(page.locator('text=ตรวจสอบข้อมูล')).toBeVisible();
    
    // Check data is displayed
    await expect(page.locator(`text=${TEST_PATIENT.fullName}`)).toBeVisible();
    await expect(page.locator(`text=${TEST_PATIENT.nationalId}`)).toBeVisible();
    await expect(page.locator(`text=${TEST_PATIENT.phone}`)).toBeVisible();
  });

  test('should navigate back to previous steps', async ({ page }) => {
    // Complete step 1
    await fillStep1(page);
    
    // We're on step 2
    await expect(page.locator('text=ข้อมูลทางการแพทย์')).toBeVisible();
    
    // Click back
    await page.click('button:has-text("ย้อนกลับ")');
    
    // Check we're back on step 1
    await expect(page.locator('text=ข้อมูลส่วนตัว')).toBeVisible();
    
    // Check data is preserved
    await expect(page.locator('input[name="fullName"]')).toHaveValue(TEST_PATIENT.fullName);
  });

  test('should complete full registration flow', async ({ page }) => {
    // Fill all steps
    await fillStep1(page);
    await fillStep2(page);
    await fillStep3(page);
    await page.click('button:has-text("ถัดไป")'); // Skip step 4
    
    // On step 5, click submit
    await page.click('button:has-text("ยืนยัน").or(button:has-text("เสร็จสิ้น"))');
    
    // Check for success message or redirect
    await expect(
      page.locator('text=สำเร็จ').or(page.locator('text=บันทึก'))
    ).toBeVisible({ timeout: 10000 });
  });
});

// Helper functions
async function fillStep1(page: any) {
  await page.selectOption('select[name="title"]', TEST_PATIENT.title);
  await page.fill('input[name="fullName"]', TEST_PATIENT.fullName);
  await page.fill('input[name="nationalId"]', TEST_PATIENT.nationalId);
  await page.fill('input[name="dob"]', TEST_PATIENT.dob);
  await page.selectOption('select[name="gender"]', TEST_PATIENT.gender);
  await page.click('button:has-text("ถัดไป")');
  await page.waitForTimeout(500);
}

async function fillStep2(page: any) {
  await page.selectOption('select[name="bloodType"]', TEST_PATIENT.bloodType);
  await page.selectOption('select[name="rhFactor"]', TEST_PATIENT.rhFactor);
  await page.selectOption('select[name="healthCoverage"]', TEST_PATIENT.healthCoverage);
  await page.click('button:has-text("ถัดไป")');
  await page.waitForTimeout(500);
}

async function fillStep3(page: any) {
  await page.fill('input[name="contactPhone"]', TEST_PATIENT.phone);
  await page.fill('input[name="currentHouseNumber"]', TEST_PATIENT.address.houseNumber);
  await page.fill('input[name="currentVillage"]', TEST_PATIENT.address.village);
  await page.fill('input[name="currentTambon"]', TEST_PATIENT.address.tambon);
  await page.fill('input[name="currentAmphoe"]', TEST_PATIENT.address.amphoe);
  await page.fill('input[name="currentChangwat"]', TEST_PATIENT.address.changwat);
  await page.fill('input[name="emergencyContactName"]', TEST_PATIENT.emergencyContact.name);
  await page.fill('input[name="emergencyContactPhone"]', TEST_PATIENT.emergencyContact.phone);
  await page.fill('input[name="emergencyContactRelation"]', TEST_PATIENT.emergencyContact.relation);
  await page.click('button:has-text("ถัดไป")');
  await page.waitForTimeout(500);
}
