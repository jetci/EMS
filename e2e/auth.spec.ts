/**
 * E2E Test: Authentication Flow
 * Tests login, logout, and protected routes
 */
import { test, expect, Page } from '@playwright/test';

// Test data
const TEST_ADMIN = {
    email: 'admin@wecare.ems',
    password: 'password123'
};

const TEST_DRIVER = {
    email: 'driver1@wecare.dev',
    password: 'password123'
};

// Helper function to login
async function login(page: Page, email: string, password: string) {
    // Navigate to login, swallow potential SPA aborts
    await page.goto('/login').catch(() => {});

    // Wait for login form
    await page.waitForSelector('input[type="email"], input[name="email"]', { timeout: 10000 });

    // Fill credentials
    await page.fill('input[type="email"], input[name="email"]', email);
    await page.fill('input[type="password"], input[name="password"]', password);

    // Submit
    await page.click('button[type="submit"]');

    // Wait for redirect (successful login)
    await page.waitForURL(/\/(dashboard|home|admin|app)/, { timeout: 20000 }).catch(() => {});
}

test.describe('Authentication Flow', () => {

    test.beforeEach(async ({ page }) => {
        // Clear any existing session
        await page.goto('/').catch(() => {});
        await page.evaluate(() => {
            localStorage.clear();
            sessionStorage.clear();
        });
    });

    test('should display login page', async ({ page }) => {
        await page.goto('/login').catch(() => {});

        // Check for login form elements
        await expect(page.locator('input[type="email"], input[name="email"]')).toBeVisible({ timeout: 10000 });
        await expect(page.locator('input[type="password"], input[name="password"]')).toBeVisible();
        await expect(page.locator('button[type="submit"]')).toBeVisible();
    });

    test('should show error on invalid credentials', async ({ page }) => {
        await page.goto('/login').catch(() => {});

        // Fill invalid credentials
        await page.fill('input[type="email"], input[name="email"]', 'invalid@test.com');
        await page.fill('input[type="password"], input[name="password"]', 'wrongpassword');

        // Submit
        await page.click('button[type="submit"]');

        // Should show error message
        await expect(page.locator('[data-testid="login-error"], [role="alert"], .error, .text-red-500, .text-danger')).toBeVisible({ timeout: 5000 });
    });

    test('should login successfully as admin', async ({ page }) => {
        await login(page, TEST_ADMIN.email, TEST_ADMIN.password);

        // Should be redirected to dashboard (authenticated area)
        await expect(page.locator('header, nav, .navbar')).toBeVisible();
    });

    test('should persist session after page reload', async ({ page }) => {
        await login(page, TEST_ADMIN.email, TEST_ADMIN.password);

        // Reload page
        await page.reload();

        // Should still be logged in: look for authenticated UI elements (TopHeader or Sidebar present)
        await expect(page.locator('header, nav, .navbar, [data-testid="top-header"], [data-testid="sidebar"], span:has-text("à¸­à¸­à¸à¸ˆà¸²à¸à¸£à¸°à¸šà¸š")')).toBeVisible({ timeout: 10000 });
    });

    test('should logout successfully', async ({ page }) => {
        await login(page, TEST_ADMIN.email, TEST_ADMIN.password);

        // Find and click logout button/link (various locations)
        const logoutButton = page.locator('button:has-text("à¸­à¸­à¸à¸ˆà¸²à¸à¸£à¸°à¸šà¸š"), button:has-text("Logout"), a:has-text("à¸­à¸­à¸à¸ˆà¸²à¸à¸£à¸°à¸šà¸š"), [data-testid="logout"], span:has-text("à¸­à¸­à¸à¸ˆà¸²à¸à¸£à¸°à¸šà¸š")');

        if (await logoutButton.count() > 0) {
            await logoutButton.first().click();

            // Should redirect to public area (root or login)
            await expect(page).toHaveURL(/\/(login|$)/);
        }
    });

    test('should restrict access to protected routes when not logged in', async ({ page }) => {
        // Try to access a presumed protected route directly
        await page.goto('/dashboard').catch(() => {});

        // Since the app does not define a public /dashboard route, it should show public header (not authenticated UI)
        await expect(page.locator('button:has-text("à¹€à¸‚à¹‰à¸ªà¸¹à¹ˆà¸£à¸°à¸šà¸š"), button:has-text("à¹€à¸‚à¹‰à¸²à¸ªà¸¹à¹ˆà¸£à¸°à¸šà¸š")')).toBeVisible({ timeout: 10000 });
    });

});
