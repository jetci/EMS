import { test, expect, Page, request as playwrightRequest } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:5174';
const API_BASE = 'http://localhost:3000';

const TEST_OFFICER = {
  email: 'officer1@wecare.dev',
  password: 'password123',
};

const TEST_ADMIN = {
  email: 'admin@wecare.ems',
  password: 'password123',
};

async function loginUI(page: Page, email: string, password: string) {
  await page.goto(`${BASE_URL}/login`).catch(() => {});
  await page.waitForSelector('input[type="email"], input[name="email"]', { timeout: 10000 });
  await page.fill('input[type="email"], input[name="email"]', email);
  await page.fill('input[type="password"], input[name="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForURL(/\/(dashboard|home|office|app)/, { timeout: 20000 }).catch(() => {});
}

async function createDriverCandidate() {
  const api = await playwrightRequest.newContext();
  const loginRes = await api.post(`${API_BASE}/api/auth/login`, {
    data: { email: TEST_ADMIN.email, password: TEST_ADMIN.password },
  });
  if (!loginRes.ok()) {
    throw new Error('Admin login failed for driver candidate setup');
  }
  const loginData = await loginRes.json();
  const token = loginData.token as string;

  const uniqueSuffix = Date.now();
  const email = `autodrv${uniqueSuffix}@wecare.test`;

  const createUserRes = await api.post(`${API_BASE}/api/users`, {
    headers: { Authorization: `Bearer ${token}` },
    data: {
      email,
      password: 'password123',
      role: 'community',
      full_name: 'E2E Driver Candidate',
      phone: '0800000000',
      status: 'Active',
    },
  });

  if (!createUserRes.ok()) {
    throw new Error(`Failed to create driver candidate user: ${createUserRes.status()}`);
  }

  const createdUser = await createUserRes.json();
  await api.dispose();

  return { email, name: createdUser.fullName || 'E2E Driver Candidate' };
}

test.describe('OfficeManageDrivers - OFFICER upgrade flow', () => {
  test('OFFICER can create driver from existing member through UI', async ({ page }) => {
    const candidate = await createDriverCandidate();

    await loginUI(page, TEST_OFFICER.email, TEST_OFFICER.password);

    await page.click('nav button:has-text("จัดการคนขับ"), [data-testid="sidebar"] button:has-text("จัดการคนขับ")');
    await page.waitForURL('**/drivers').catch(() => {});

    await expect(page.locator('h1')).toContainText('จัดการข้อมูลคนขับ');

    await page.click('button:has-text("เพิ่มคนขับใหม่")');

    await page.waitForSelector('text=ค้นหาสมาชิกเพื่อลงทะเบียนเป็นคนขับ', { timeout: 10000 });

    await page.fill('input[placeholder="พิมพ์ชื่อ หรือ อีเมลของสมาชิก..."]', candidate.email);
    await page.waitForTimeout(500);

    await page.click(`text=${candidate.email}`);

    await page.fill('input[name="vehicleBrand"]', 'Toyota');
    await page.fill('input[name="vehicleModel"]', 'Commuter');
    await page.fill('input[name="vehicleColor"]', 'ขาว');
    await page.fill('input[name="licensePlate"]', `E2E-${Date.now()}`);
    await page.fill('textarea[name="address"]', 'E2E Test Address');

    await page.click('button:has-text("ยืนยันการเพิ่มคนขับ")');

    await page.waitForTimeout(1000);

    await expect(page.locator('table')).toContainText(candidate.name);
  });
}
);
