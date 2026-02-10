import { test, expect, Page } from '@playwright/test';

// Test users (reuse same credentials pattern as auth.spec.ts)
const TEST_ADMIN = {
  email: 'admin@wecare.ems',
  password: 'password123',
};

async function login(page: Page, email: string, password: string) {
  await page.goto('/login').catch(() => {});
  await page.waitForSelector('input[type="email"], input[name="email"]', { timeout: 10000 });
  await page.fill('input[type="email"], input[name="email"]', email);
  await page.fill('input[type="password"], input[name="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForURL(/\/(dashboard|home|admin|app)/, { timeout: 20000 }).catch(() => {});
}

async function gotoProfile(page: Page) {
  // Open Profile via Sidebar nav item
  const profileNav = page.locator('[data-testid="sidebar-nav-profile"], [data-testid="bottom-nav-profile"], button:has-text("à¹‚à¸›à¸£à¹„à¸Ÿà¸¥à¹Œ")');
  await expect(profileNav.first()).toBeVisible({ timeout: 10000 });
  await profileNav.first().click();
  // Wait for ProfilePage heading
  await expect(page.locator('h1:has-text("à¹‚à¸›à¸£à¹„à¸Ÿà¸¥à¹Œà¸‚à¸­à¸‡à¸‰à¸±à¸™"), h1:has-text("à¹‚à¸›à¸£à¹„à¸Ÿà¸¥à¹Œà¹à¸¥à¸°à¸à¸²à¸£à¸•à¸±à¹‰à¸‡à¸„à¹ˆà¸²")')).toBeVisible({ timeout: 10000 });
}

function tinyPngBuffer(): Buffer {
  // 1x1 transparent PNG
  const b64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAOe0kakAAAAASUVORK5CYII=';
  return Buffer.from(b64, 'base64');
}

test.describe('Profile Page - Image Upload', () => {
  test.beforeEach(async ({ page }) => {
    // Clear storage at document init for our origin to avoid security/context issues
    await page.addInitScript(() => {
      try {
        localStorage.clear();
        sessionStorage.clear();
      } catch {}
    });

    await page.goto('/').catch(() => {});
    await login(page, TEST_ADMIN.email, TEST_ADMIN.password);
    await gotoProfile(page);
  });

  test('should render profile page and image input', async ({ page }) => {
    await expect(page.locator('#profile-image-input')).toHaveCount(1);
  });

  test('should show error toast when selecting non-image file', async ({ page }) => {
    const input = page.locator('#profile-image-input');
    await input.setInputFiles({ name: 'not-image.txt', mimeType: 'text/plain', buffer: Buffer.from('hello') });
    const alert = page.getByRole('alert');
    await expect(alert).toContainText('à¸à¸£à¸¸à¸“à¸²à¹€à¸¥à¸·à¸­à¸à¹„à¸Ÿà¸¥à¹Œà¸£à¸¹à¸›à¸ à¸²à¸ž', { timeout: 5000 });
    // Toast auto-dismiss after ~3s
    await page.waitForTimeout(4000);
    await expect(alert).toBeHidden();
  });

  test('should show error toast when selecting image larger than 5MB', async ({ page }) => {
    const input = page.locator('#profile-image-input');
    // 6MB dummy PNG buffer
    await input.setInputFiles({ name: 'too-large.png', mimeType: 'image/png', buffer: Buffer.alloc(6 * 1024 * 1024, 0) });
    const alert = page.getByRole('alert');
    await expect(alert).toContainText('à¸‚à¸™à¸²à¸”à¹„à¸Ÿà¸¥à¹Œà¸•à¹‰à¸­à¸‡à¹„à¸¡à¹ˆà¹€à¸à¸´à¸™ 5MB', { timeout: 5000 });
    await page.waitForTimeout(4000);
    await expect(alert).toBeHidden();
  });

  test('should upload valid image and show success toast', async ({ page }) => {
    const input = page.locator('#profile-image-input');
    await input.setInputFiles({ name: 'avatar.png', mimeType: 'image/png', buffer: tinyPngBuffer() });

    const alert = page.getByRole('alert');
    await expect(alert).toContainText('âœ… à¸­à¸±à¸žà¹‚à¸«à¸¥à¸”à¸£à¸¹à¸›à¸ à¸²à¸žà¹€à¸£à¸µà¸¢à¸šà¸£à¹‰à¸­à¸¢à¹à¸¥à¹‰à¸§', { timeout: 10000 });

    // Toast auto-dismiss
    await page.waitForTimeout(4000);
    await expect(alert).toBeHidden();
  });

  test('auto upload flow should not show manual save/cancel buttons', async ({ page }) => {
    const input = page.locator('#profile-image-input');
    await input.setInputFiles({ name: 'avatar.png', mimeType: 'image/png', buffer: tinyPngBuffer() });

    const saveBtn = page.getByRole('button', { name: 'à¸šà¸±à¸™à¸—à¸¶à¸à¸£à¸¹à¸›à¸ à¸²à¸ž' });
    const cancelBtn = page.getByRole('button', { name: 'à¸¢à¸à¹€à¸¥à¸´à¸' });

    await expect(saveBtn).toHaveCount(0);
    await expect(cancelBtn).toHaveCount(0);
  });


});
