/**
 * Basic API smoke tests for EMS WeCare backend.
 *
 * These tests expect the backend server to be running (see TESTS_README.md).
 */

const BASE = process.env.API_URL || 'http://localhost:3001';
const TIMEOUT_MS = 5000;

const shouldRun = process.env.RUN_API_SMOKE_TESTS === 'true';

async function fetchWithTimeout(url: string, init?: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

(shouldRun ? describe : describe.skip)('EMS WeCare API - smoke tests', () => {
  test('health endpoint returns OK', async () => {
    const start = Date.now();
    const res = await fetchWithTimeout(`${BASE}/api/health`);
    const latency = Date.now() - start;

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty('status', 'ok');
    expect(latency).toBeLessThan(2000); // expect <2s
  });

  test('unauthenticated auth/login returns 400 for missing fields', async () => {
    const res = await fetchWithTimeout(`${BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });

    expect([400, 429, 401]).toContain(res.status); // allow rate limit or invalid
  });

  test('GET /api/rides returns 401 when no token provided', async () => {
    const res = await fetchWithTimeout(`${BASE}/api/rides`);
    expect([401, 403]).toContain(res.status);
  });
});
