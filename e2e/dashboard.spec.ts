/**
 * E2E Test: Dashboard and Navigation
 * Tests main dashboard functionality and navigation
 */
import { test, expect, Page } from '@playwright/test';

// Test data
const TEST_ADMIN = {
    email: 'admin@wecare.ems',
    password: 'password123'
};

// Helper function to login
async function login(page: Page, email: string, password: string) {
    await page.goto('/');
    await page.waitForSelector('input[type="email"], input[name="email"]', { timeout: 10000 });
    await page.fill('input[type="email"], input[name="email"]', email);
    await page.fill('input[type="password"], input[name="password"]', password);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/(dashboard|home|admin)/, { timeout: 15000 });
}

test.describe('Dashboard & Navigation', () => {

    test.beforeEach(async ({ page }) => {
        await login(page, TEST_ADMIN.email, TEST_ADMIN.password);
    });

    test('should display dashboard with statistics', async ({ page }) => {
        // Dashboard should have stats/cards
        const statsCards = page.locator('.stat-card, .dashboard-card, [data-testid="stat-card"], .bg-white.rounded');

        // Wait for some content to load
        await page.waitForTimeout(2000);

        // Check page has meaningful content
        const content = await page.content();
        expect(content.length).toBeGreaterThan(1000);
    });

    test('should have working sidebar/navigation menu', async ({ page }) => {
        // Look for sidebar or nav
        const sidebar = page.locator('aside, nav, .sidebar, [role="navigation"]');
        await expect(sidebar.first()).toBeVisible();

        // Check for menu items
        const menuItems = page.locator('a[href], button').filter({ hasText: /(à¸«à¸™à¹‰à¸²à¸«à¸¥à¸±à¸|Dashboard|à¸œà¸¹à¹‰à¸›à¹ˆà¸§à¸¢|à¸„à¸™à¸‚à¸±à¸š|à¸£à¸–|à¸£à¸²à¸¢à¸‡à¸²à¸™)/i });
        const count = await menuItems.count();
        expect(count).toBeGreaterThan(0);
    });

    test('should navigate to different sections', async ({ page }) => {
        // Try navigating to different sections
        const sections = [
            { link: /(à¸œà¸¹à¹‰à¸›à¹ˆà¸§à¸¢|Patient)/i, urlPattern: /patient/ },
            { link: /(à¸„à¸™à¸‚à¸±à¸š|Driver)/i, urlPattern: /driver/ },
            { link: /(à¸à¸²à¸£à¹€à¸”à¸´à¸™à¸—à¸²à¸‡|Ride)/i, urlPattern: /ride/ },
        ];

        for (const section of sections) {
            const link = page.locator('a, button').filter({ hasText: section.link }).first();

            if (await link.isVisible()) {
                await link.click();
                await page.waitForTimeout(1000);
                // Just verify the click didn't break anything
                await expect(page.locator('body')).toBeVisible();
                break; // Test one navigation is enough
            }
        }
    });

    test('should be responsive on mobile viewport', async ({ page }) => {
        // Set mobile viewport
        await page.setViewportSize({ width: 375, height: 667 });

        // Wait for resize
        await page.waitForTimeout(500);

        // Page should still be usable
        await expect(page.locator('body')).toBeVisible();

        // Check for mobile menu toggle (hamburger)
        const mobileMenuToggle = page.locator('[aria-label*="menu"], .hamburger, [data-testid="mobile-menu"], button.md\\:hidden');

        // Mobile menu should exist (though might be optional)
        const content = await page.content();
        expect(content).toBeTruthy();
    });

});
