/**
 * E2E Tests for Profile Page
 * Tests profile viewing, editing, and password change functionality
 */

import { test, expect } from '@playwright/test';

// Test data
const TEST_USER = {
  email: 'community1@wecare.dev',
  password: 'password',
  name: 'ชุมชนทดสอบ 1',
  newName: 'ชุมชนทดสอบ แก้ไขแล้ว',
  phone: '0812345678',
  newPhone: '0898765432',
  role: 'COMMUNITY'
};

test.describe('Profile Page', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('http://localhost:5174');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Click login button
    await page.click('text=เข้าสู่ระบบ');
    
    // Fill login form
    await page.fill('input[name="email"]', TEST_USER.email);
    await page.fill('input[name="password"]', TEST_USER.password);
    
    // Submit login
    await page.click('button[type="submit"]');
    
    // Wait for redirect to dashboard
    await page.waitForURL(/.*dashboard/);
    
    // Navigate to profile page
    await page.click('text=โปรไฟล์');
    await page.waitForURL(/.*profile/);
  });

  test('should display profile information', async ({ page }) => {
    // Check page title
    await expect(page.locator('h1')).toContainText('โปรไฟล์ของฉัน');
    
    // Check profile data is displayed
    await expect(page.locator('input[name="name"]')).toHaveValue(TEST_USER.name);
    await expect(page.locator('input[id="email"]')).toHaveValue(TEST_USER.email);
    
    // Check email and role are disabled
    await expect(page.locator('input[id="email"]')).toBeDisabled();
    await expect(page.locator('input[id="role"]')).toBeDisabled();
  });

  test('should update profile name successfully', async ({ page }) => {
    // Clear and fill new name
    await page.fill('input[name="name"]', '');
    await page.fill('input[name="name"]', TEST_USER.newName);
    
    // Click save button
    await page.click('button[type="submit"]');
    
    // Wait for toast notification
    await expect(page.locator('text=บันทึกข้อมูลสำเร็จ')).toBeVisible({ timeout: 5000 });
    
    // Verify name was updated
    await page.reload();
    await expect(page.locator('input[name="name"]')).toHaveValue(TEST_USER.newName);
    
    // Restore original name
    await page.fill('input[name="name"]', TEST_USER.name);
    await page.click('button[type="submit"]');
    await expect(page.locator('text=บันทึกข้อมูลสำเร็จ')).toBeVisible({ timeout: 5000 });
  });

  test('should update profile phone successfully', async ({ page }) => {
    // Fill new phone
    await page.fill('input[name="phone"]', TEST_USER.newPhone);
    
    // Click save button
    await page.click('button[type="submit"]');
    
    // Wait for toast notification
    await expect(page.locator('text=บันทึกข้อมูลสำเร็จ')).toBeVisible({ timeout: 5000 });
    
    // Verify phone was updated
    await page.reload();
    await expect(page.locator('input[name="phone"]')).toHaveValue(TEST_USER.newPhone);
    
    // Restore original phone
    await page.fill('input[name="phone"]', TEST_USER.phone);
    await page.click('button[type="submit"]');
    await expect(page.locator('text=บันทึกข้อมูลสำเร็จ')).toBeVisible({ timeout: 5000 });
  });

  test('should validate empty name', async ({ page }) => {
    // Clear name
    await page.fill('input[name="name"]', '');
    
    // Click save button
    await page.click('button[type="submit"]');
    
    // Check error message
    await expect(page.locator('text=กรุณากรอกชื่อ')).toBeVisible();
  });

  test('should validate invalid phone number', async ({ page }) => {
    // Fill invalid phone (too short)
    await page.fill('input[name="phone"]', '123');
    
    // Click save button
    await page.click('button[type="submit"]');
    
    // Check error message
    await expect(page.locator('text=เบอร์โทรศัพท์ต้องเป็นตัวเลข 9-10 หลัก')).toBeVisible();
  });

  test('should cancel profile edit', async ({ page }) => {
    const originalName = await page.locator('input[name="name"]').inputValue();
    
    // Change name
    await page.fill('input[name="name"]', 'ชื่อใหม่ชั่วคราว');
    
    // Click cancel button
    await page.click('button:has-text("ยกเลิก")');
    
    // Verify name was reset
    await expect(page.locator('input[name="name"]')).toHaveValue(originalName);
  });

  test('should open change password modal', async ({ page }) => {
    // Click change password button
    await page.click('button:has-text("เปลี่ยนรหัสผ่าน")');
    
    // Check modal is visible
    await expect(page.locator('text=เปลี่ยนรหัสผ่าน').first()).toBeVisible();
    
    // Check modal has all fields
    await expect(page.locator('input[name="currentPassword"]')).toBeVisible();
    await expect(page.locator('input[name="newPassword"]')).toBeVisible();
    await expect(page.locator('input[name="confirmPassword"]')).toBeVisible();
  });

  test('should close change password modal', async ({ page }) => {
    // Open modal
    await page.click('button:has-text("เปลี่ยนรหัสผ่าน")');
    await expect(page.locator('text=เปลี่ยนรหัสผ่าน').first()).toBeVisible();
    
    // Click cancel button
    await page.click('button:has-text("ยกเลิก")');
    
    // Check modal is closed
    await expect(page.locator('input[name="currentPassword"]')).not.toBeVisible();
  });

  test('should toggle password visibility', async ({ page }) => {
    // Open modal
    await page.click('button:has-text("เปลี่ยนรหัสผ่าน")');
    
    // Check current password field is type password
    await expect(page.locator('input[name="currentPassword"]')).toHaveAttribute('type', 'password');
    
    // Click show password button (first eye icon)
    await page.locator('input[name="currentPassword"]').locator('..').locator('button').click();
    
    // Check field changed to text
    await expect(page.locator('input[name="currentPassword"]')).toHaveAttribute('type', 'text');
    
    // Click again to hide
    await page.locator('input[name="currentPassword"]').locator('..').locator('button').click();
    
    // Check field changed back to password
    await expect(page.locator('input[name="currentPassword"]')).toHaveAttribute('type', 'password');
  });

  test('should validate password change form', async ({ page }) => {
    // Open modal
    await page.click('button:has-text("เปลี่ยนรหัสผ่าน")');
    
    // Click submit without filling
    await page.click('button:has-text("เปลี่ยนรหัสผ่าน"):not(:has-text("เปลี่ยนรหัสผ่าน"))');
    
    // Check error messages
    await expect(page.locator('text=กรุณากรอกรหัสผ่านปัจจุบัน')).toBeVisible();
  });

  test('should validate password length', async ({ page }) => {
    // Open modal
    await page.click('button:has-text("เปลี่ยนรหัสผ่าน")');
    
    // Fill short password
    await page.fill('input[name="currentPassword"]', 'test');
    await page.fill('input[name="newPassword"]', '123');
    await page.fill('input[name="confirmPassword"]', '123');
    
    // Click submit
    await page.click('button:has-text("เปลี่ยนรหัสผ่าน"):not(:has-text("เปลี่ยนรหัสผ่าน"))');
    
    // Check error message
    await expect(page.locator('text=รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร')).toBeVisible();
  });

  test('should validate password match', async ({ page }) => {
    // Open modal
    await page.click('button:has-text("เปลี่ยนรหัสผ่าน")');
    
    // Fill mismatched passwords
    await page.fill('input[name="currentPassword"]', 'password');
    await page.fill('input[name="newPassword"]', 'newpass123');
    await page.fill('input[name="confirmPassword"]', 'different123');
    
    // Click submit
    await page.click('button:has-text("เปลี่ยนรหัสผ่าน"):not(:has-text("เปลี่ยนรหัสผ่าน"))');
    
    // Check error message
    await expect(page.locator('text=รหัสผ่านไม่ตรงกัน')).toBeVisible();
  });

  test('should show password strength indicator', async ({ page }) => {
    // Open modal
    await page.click('button:has-text("เปลี่ยนรหัสผ่าน")');
    
    // Fill weak password
    await page.fill('input[name="newPassword"]', '123456');
    
    // Check strength indicator appears
    await expect(page.locator('text=อ่อน').or(page.locator('text=ปานกลาง')).or(page.locator('text=แข็งแรง'))).toBeVisible();
  });

  test('should handle loading state during save', async ({ page }) => {
    // Change name
    await page.fill('input[name="name"]', 'ชื่อทดสอบ');
    
    // Click save
    const saveButton = page.locator('button[type="submit"]');
    await saveButton.click();
    
    // Check button is disabled during loading
    await expect(saveButton).toBeDisabled();
    
    // Wait for completion
    await expect(page.locator('text=บันทึกข้อมูลสำเร็จ')).toBeVisible({ timeout: 5000 });
    
    // Check button is enabled again
    await expect(saveButton).toBeEnabled();
  });
});

test.describe('Profile Page - Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('http://localhost:5174');
    await page.waitForLoadState('networkidle');
    await page.click('text=เข้าสู่ระบบ');
    await page.fill('input[name="email"]', TEST_USER.email);
    await page.fill('input[name="password"]', TEST_USER.password);
    await page.click('button[type="submit"]');
    await page.waitForURL(/.*dashboard/);
    await page.click('text=โปรไฟล์');
    await page.waitForURL(/.*profile/);
  });

  test('should have proper ARIA labels', async ({ page }) => {
    // Check form has labels
    await expect(page.locator('label[for="name"]')).toBeVisible();
    await expect(page.locator('label[for="phone"]')).toBeVisible();
    await expect(page.locator('label[for="email"]')).toBeVisible();
    await expect(page.locator('label[for="role"]')).toBeVisible();
  });

  test('should be keyboard navigable', async ({ page }) => {
    // Tab through form fields
    await page.keyboard.press('Tab'); // Name field
    await expect(page.locator('input[name="name"]')).toBeFocused();
    
    await page.keyboard.press('Tab'); // Phone field
    await expect(page.locator('input[name="phone"]')).toBeFocused();
    
    await page.keyboard.press('Tab'); // Email field (disabled)
    await page.keyboard.press('Tab'); // Role field (disabled)
    await page.keyboard.press('Tab'); // Cancel button
    await page.keyboard.press('Tab'); // Save button
  });

  test('should support Enter key to submit', async ({ page }) => {
    // Focus on name field
    await page.locator('input[name="name"]').click();
    
    // Change name
    await page.fill('input[name="name"]', 'ชื่อใหม่');
    
    // Press Enter
    await page.keyboard.press('Enter');
    
    // Check form was submitted
    await expect(page.locator('text=บันทึกข้อมูลสำเร็จ')).toBeVisible({ timeout: 5000 });
  });
});

test.describe('Profile Page - Responsive', () => {
  test('should work on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Login
    await page.goto('http://localhost:5174');
    await page.waitForLoadState('networkidle');
    await page.click('text=เข้าสู่ระบบ');
    await page.fill('input[name="email"]', TEST_USER.email);
    await page.fill('input[name="password"]', TEST_USER.password);
    await page.click('button[type="submit"]');
    await page.waitForURL(/.*dashboard/);
    await page.click('text=โปรไฟล์');
    
    // Check page is visible
    await expect(page.locator('h1:has-text("โปรไฟล์ของฉัน")')).toBeVisible();
    
    // Check form is usable
    await expect(page.locator('input[name="name"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('should work on tablet viewport', async ({ page }) => {
    // Set tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    
    // Login
    await page.goto('http://localhost:5174');
    await page.waitForLoadState('networkidle');
    await page.click('text=เข้าสู่ระบบ');
    await page.fill('input[name="email"]', TEST_USER.email);
    await page.fill('input[name="password"]', TEST_USER.password);
    await page.click('button[type="submit"]');
    await page.waitForURL(/.*dashboard/);
    await page.click('text=โปรไฟล์');
    
    // Check page is visible
    await expect(page.locator('h1:has-text("โปรไฟล์ของฉัน")')).toBeVisible();
  });
});
