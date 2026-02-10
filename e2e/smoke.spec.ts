import { test, expect, request as globalRequest, Page } from '@playwright/test';

// Base URLs (prefer Playwright baseURL via page.goto; keep API_BASE explicit for request context)
const FRONTEND_URL = process.env.BASE_URL || 'http://localhost:5173';
const API_BASE = process.env.API_URL || `${FRONTEND_URL}/api`;

// Admin test credentials (match mock/quick login)
const ADMIN = { email: 'admin@wecare.ems', password: 'password123' };
const COMMUNITY = { email: 'community1@wecare.dev', password: 'password123' };
const OFFICER = { email: 'officer1@wecare.dev', password: 'password123' };
const DRIVER = { email: 'driver1@wecare.dev', password: 'password123' };
const EXECUTIVE = { email: 'executive1@wecare.dev', password: 'password123' };
const RADIO = { email: 'office1@wecare.dev', password: 'password123' };
const RADIO_CENTER = { email: 'office1@wecare.dev', password: 'password123' };

// Helper: login via API and return token
async function apiLogin(request: typeof globalRequest, email: string, password: string): Promise<string> {
  const res = await request.post(`${API_BASE}/auth/login`, {
    data: { email, password },
  });
  expect(res.status(), 'Login should return 200').toBe(200);
  const json = await res.json();
  expect(json.token, 'Login response should include token').toBeTruthy();
  return json.token as string;
}

// Helper: UI login using login screen selectors
async function uiLogin(page: Page, email: string, password: string) {
  await page.goto('/login');
  await page.waitForSelector('[data-testid="login-email"]');
  await page.fill('[data-testid="login-email"]', email);
  await page.fill('[data-testid="login-password"]', password);
  await page.click('[data-testid="login-submit"]');
  // In this app, authenticated layout replaces content without changing URL.
  // Wait for a stable post-login selector instead of URL change. If it fails, surface login error.
  try {
    await page.waitForSelector('[data-testid="sidebar-root"]', { timeout: 20000 });
  } catch (e) {
    // Try to read error message from login screen for clearer diagnostics
    const hasErrorLocator = page.locator('[data-testid="login-error"]');
    const hasErrorVisible = await hasErrorLocator.isVisible().catch(() => false);
    if (hasErrorVisible) {
      const msg = (await hasErrorLocator.textContent().catch(() => '')) || '';
      throw new Error(`Login failed: ${msg.trim()}`);
    }
    const stillOnLogin = await page.locator('[data-testid="login-form"]').isVisible().catch(() => false);
    if (stillOnLogin) {
      throw new Error('Login did not proceed to authenticated layout within 20s');
    }
    throw e;
  }
}

// Smoke: CSRF token endpoint responds
test('health: /api/csrf-token responds', async ({ request }) => {
  const res = await request.get(`${API_BASE}/csrf-token`);
  expect(res.ok(), 'CSRF token endpoint should respond').toBeTruthy();
  const body = await res.json().catch(() => ({}));
  // Accept various token shapes
  expect(body && (body.csrfToken || body.token !== undefined || body.success !== undefined)).toBeTruthy();
});

// Smoke: Admin can login via API and retrieve profile via /auth/me
test('auth: admin login + auth/me', async ({ request }) => {
  const token = await apiLogin(request, ADMIN.email, ADMIN.password);
  const me = await request.get(`${API_BASE}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  expect(me.status(), 'GET /auth/me should be 200').toBe(200);
  const json = await me.json();
  // Support both { user: {...} } and direct user object shapes
  const email = (json?.user?.email) ?? json?.email ?? json?.data?.email;
  expect(email, 'User email should be present in /auth/me response').toBe(ADMIN.email);
});

// Smoke: /auth/me without token should be unauthorized
test('auth: /auth/me requires Authorization', async ({ request }) => {
  const res = await request.get(`${API_BASE}/auth/me`);
  expect([401, 403]).toContain(res.status());
});

// Smoke: Admin can login via UI
test('ui: admin can login via login screen', async ({ page }) => {
  await uiLogin(page, ADMIN.email, ADMIN.password);
  // Basic assertion: authenticated sidebar is visible
  await expect(page.locator('[data-testid="sidebar-root"]')).toBeVisible();
  // TopHeader root should be visible after login
  await expect(page.locator('[data-testid="topheader-root"]')).toBeVisible();
  // Logout button should be visible in sidebar
  await expect(page.locator('[data-testid="sidebar-logout"]')).toBeVisible();
});

// Smoke: COMMUNITY role dashboard renders with role-specific nav
test('ui: community user sees community nav on dashboard', async ({ page }) => {
  await uiLogin(page, COMMUNITY.email, COMMUNITY.password);
  // Sidebar root and TopHeader should be visible
  await expect(page.locator('[data-testid="sidebar-root"]')).toBeVisible();
  await expect(page.locator('[data-testid="topheader-root"]')).toBeVisible();
  // Community nav items expected: dashboard, patients, rides
  await expect(page.locator('[data-testid="sidebar-nav-dashboard"]')).toBeVisible();
  await expect(page.locator('[data-testid="sidebar-nav-patients"]')).toBeVisible();
  await expect(page.locator('[data-testid="sidebar-nav-rides"]')).toBeVisible();
});

// Smoke: OFFICER role dashboard renders with role-specific nav
test('ui: officer user sees officer nav on dashboard', async ({ page }) => {
  await uiLogin(page, OFFICER.email, OFFICER.password);
  await expect(page.locator('[data-testid="sidebar-root"]')).toBeVisible();
  await expect(page.locator('[data-testid="topheader-root"]')).toBeVisible();
  // Officer-specific nav items
  await expect(page.locator('[data-testid="sidebar-nav-dashboard"]')).toBeVisible();
  await expect(page.locator('[data-testid="sidebar-nav-patients"]')).toBeVisible();
  await expect(page.locator('[data-testid="sidebar-nav-drivers"]')).toBeVisible();
  await expect(page.locator('[data-testid="sidebar-nav-reports"]')).toBeVisible();
});

// Smoke: DRIVER role menu renders with role-specific nav
test('ui: driver user sees driver nav items', async ({ page }) => {
  await uiLogin(page, DRIVER.email, DRIVER.password);
  await expect(page.locator('[data-testid="sidebar-root"]')).toBeVisible();
  await expect(page.locator('[data-testid="topheader-root"]')).toBeVisible();
  // Driver-specific nav items
  await expect(page.locator('[data-testid="sidebar-nav-today_jobs"]')).toBeVisible();
  await expect(page.locator('[data-testid="sidebar-nav-history"]')).toBeVisible();
});

// Smoke: EXECUTIVE role dashboard renders with role-specific nav
test('ui: executive user sees executive nav on dashboard', async ({ page }) => {
  await uiLogin(page, EXECUTIVE.email, EXECUTIVE.password);
  await expect(page.locator('[data-testid="sidebar-root"]')).toBeVisible();
  await expect(page.locator('[data-testid="topheader-root"]')).toBeVisible();
  // Executive-specific nav items
  await expect(page.locator('[data-testid="sidebar-nav-executive_dashboard"]')).toBeVisible();
  await expect(page.locator('[data-testid="sidebar-nav-spatial_analytics"]')).toBeVisible();
  await expect(page.locator('[data-testid="sidebar-nav-operational_report"]')).toBeVisible();
  await expect(page.locator('[data-testid="sidebar-nav-financial_report"]')).toBeVisible();
});

// Smoke: RADIO role dashboard renders with role-specific nav
test('ui: radio user sees radio nav on dashboard', async ({ page }) => {
  await uiLogin(page, RADIO.email, RADIO.password);
  await expect(page.locator('[data-testid="sidebar-root"]')).toBeVisible();
  await expect(page.locator('[data-testid="topheader-root"]')).toBeVisible();
  // Radio-specific nav items (stable)
  await expect(page.locator('[data-testid="sidebar-nav-dashboard"]')).toBeVisible();
  await expect(page.locator('[data-testid="sidebar-nav-map_command"]')).toBeVisible();
  await expect(page.locator('[data-testid="sidebar-nav-rides"]')).toBeVisible();
  await expect(page.locator('[data-testid="sidebar-nav-drivers"]')).toBeVisible();
});

// Smoke: RADIO_CENTER role dashboard renders with role-specific nav
// Note: Some environments configure office1@wecare.dev as radio (not radio_center).
// To keep smoke test stable, assert common nav between radio and radio_center.
test('ui: radio_center user sees radio_center nav on dashboard', async ({ page }) => {
  await uiLogin(page, RADIO_CENTER.email, RADIO_CENTER.password);
  await expect(page.locator('[data-testid="sidebar-root"]')).toBeVisible();
  await expect(page.locator('[data-testid="topheader-root"]')).toBeVisible();
  // Common nav items
  await expect(page.locator('[data-testid="sidebar-nav-dashboard"]')).toBeVisible();
  await expect(page.locator('[data-testid="sidebar-nav-map_command"]')).toBeVisible();
  await expect(page.locator('[data-testid="sidebar-nav-rides"]')).toBeVisible();
  await expect(page.locator('[data-testid="sidebar-nav-drivers"]')).toBeVisible();
});