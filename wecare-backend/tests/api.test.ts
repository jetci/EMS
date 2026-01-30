/**
 * Basic API smoke tests for EMS WeCare backend.
 *
 * These tests expect the backend server to be running (see TESTS_README.md).
 * They use `node-fetch` to perform HTTP requests to endpoints and validate
 * status codes, latency, and minimal response schema.
 */

import fetch from 'node-fetch';

const BASE = process.env.API_URL || 'http://localhost:3001';
const TIMEOUT_MS = 5000;

describe('EMS WeCare API - smoke tests', () => {
  test('health endpoint returns OK', async () => {
    const start = Date.now();
    const res = await fetch(`${BASE}/api/health`, { timeout: TIMEOUT_MS });
    const latency = Date.now() - start;

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty('status', 'ok');
    expect(latency).toBeLessThan(2000); // expect <2s
  });

  test('unauthenticated auth/login returns 400 for missing fields', async () => {
    const res = await fetch(`${BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });

    expect([400, 429, 401]).toContain(res.status); // allow rate limit or invalid
  });

  test('GET /api/rides returns 401 when no token provided', async () => {
    const res = await fetch(`${BASE}/api/rides`);
    expect([401, 403]).toContain(res.status);
  });
});
