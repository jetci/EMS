import { test, expect, Page } from '@playwright/test';

const ADMIN_USER = {
  email: 'admin@wecare.ems',
  password: 'password123',
};

async function loginAsAdmin(page: Page) {
  await page.goto('/login');
  await page.waitForSelector('[data-testid="login-email"]');
  await page.fill('[data-testid="login-email"]', ADMIN_USER.email);
  await page.fill('[data-testid="login-password"]', ADMIN_USER.password);
  await page.click('[data-testid="login-submit"]');
  await page.waitForSelector('[data-testid="sidebar-root"]', { timeout: 20000 });
}

test.describe('Manage Facilities Page (Admin)', () => {
  test('can open manage facilities page from sidebar', async ({ page }) => {
    await loginAsAdmin(page);

    await page.click('text=จัดการสถานพยาบาล');

    await expect(page.locator('h1')).toContainText('จัดการสถานพยาบาล');
    await expect(page.locator('text=รายการสถานพยาบาล')).toBeVisible();
  });

  test('can create a new facility and see it in the list', async ({ page }) => {
    await loginAsAdmin(page);

    await page.click('text=จัดการสถานพยาบาล');

    await expect(page.locator('h1')).toContainText('จัดการสถานพยาบาล');

    const facilityName = `รพ.E2E ${Date.now()}`;

    await page.click('text=+ เพิ่มสถานพยาบาล');

    await page.fill('input[name="name"]', facilityName);
    await page.fill('input[name="lat"]', '18.800000');
    await page.fill('input[name="lng"]', '99.000000');

    await page.click('button:has-text("บันทึก")');

    await expect(page.locator('text=บันทึกข้อมูลสำเร็จ')).toBeVisible({ timeout: 10000 });

    await expect(page.locator('text=' + facilityName)).toBeVisible({ timeout: 10000 });
  });
});
