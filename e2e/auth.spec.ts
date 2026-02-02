/**
 * E2E Test: Authentication Flow
 * Tests login, logout, and protected routes
 */
import { test, expect, Page } from '@playwright/test';

// Test data
const TEST_ADMIN = {
    email: 'admin@wecare.ems',
    password: 'admin123'
};

const TEST_DRIVER = {
    email: 'driver1@wecare.dev',
    password: 'driver123'
};

// Helper function to login
async function login(page: Page, email: string, password: string) {
    await page.goto('/');

    // Wait for login form
    await page.waitForSelector('input[type="email"], input[name="email"]', { timeout: 10000 });

    // Fill credentials
    await page.fill('input[type="email"], input[name="email"]', email);
    await page.fill('input[type="password"], input[name="password"]', password);

    // Submit
    await page.click('button[type="submit"]');

    // Wait for redirect (successful login)
    await page.waitForURL(/\/(dashboard|home|admin)/, { timeout: 15000 });
}

test.describe('Authentication Flow', () => {

    test.beforeEach(async ({ page }) => {
        // Clear any existing session
        await page.goto('/');
        await page.evaluate(() => {
            localStorage.clear();
            sessionStorage.clear();
        });
    });

    test('should display login page', async ({ page }) => {
        await page.goto('/');

        // Check for login form elements
        await expect(page.locator('input[type="email"], input[name="email"]')).toBeVisible({ timeout: 10000 });
        await expect(page.locator('input[type="password"], input[name="password"]')).toBeVisible();
        await expect(page.locator('button[type="submit"]')).toBeVisible();
    });

    test('should show error on invalid credentials', async ({ page }) => {
        await page.goto('/');

        // Fill invalid credentials
        await page.fill('input[type="email"], input[name="email"]', 'invalid@test.com');
        await page.fill('input[type="password"], input[name="password"]', 'wrongpassword');

        // Submit
        await page.click('button[type="submit"]');

        // Should show error message
        await expect(page.locator('[role="alert"], .error, .text-red-500, .text-danger')).toBeVisible({ timeout: 5000 });
    });

    test('should login successfully as admin', async ({ page }) => {
        await login(page, TEST_ADMIN.email, TEST_ADMIN.password);

        // Should be redirected to dashboard
        await expect(page).toHaveURL(/\/(dashboard|home|admin)/);

        // Should see user menu or profile
        await expect(page.locator('header, nav, .navbar')).toBeVisible();
    });

    test('should persist session after page reload', async ({ page }) => {
        await login(page, TEST_ADMIN.email, TEST_ADMIN.password);

        // Reload page
        await page.reload();

        // Should still be logged in (not redirected to login)
        await expect(page).not.toHaveURL(/\/login/);
    });

    test('should logout successfully', async ({ page }) => {
        await login(page, TEST_ADMIN.email, TEST_ADMIN.password);

        // Find and click logout button/link
        const logoutButton = page.locator('button:has-text("ออกจากระบบ"), button:has-text("Logout"), a:has-text("ออกจากระบบ"), [data-testid="logout"]');

        if (await logoutButton.count() > 0) {
            await logoutButton.first().click();

            // Should redirect to login page
            await expect(page).toHaveURL(/\/(login|$)/);
        }
    });

    test('should restrict access to protected routes when not logged in', async ({ page }) => {
        // Try to access protected route directly
        await page.goto('/dashboard');

        // Should redirect to login
        await expect(page).toHaveURL(/\/(login|$)/, { timeout: 10000 });
    });

});
